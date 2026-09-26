using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using LuotKhamEntity = ClinicManagement.Domain.Examination.LuotKham;

namespace ClinicManagement.Application.Features.LichHen.Commands.TiepNhanLichHen
{
    public class TiepNhanLichHenCommand : IRequest<TiepNhanLichHenResultDto>
    {
        public int MaLichHen { get; set; }
        public int NguoiTiepNhan { get; set; }
    }

    public class TiepNhanLichHenCommandHandler : IRequestHandler<TiepNhanLichHenCommand, TiepNhanLichHenResultDto>
    {
        private readonly ILichHenRepository _lichHenRepo;
        private readonly ILuotKhamRepository _luotKhamRepo;
        private readonly IHoaDonRepository _hoaDonRepo;

        public TiepNhanLichHenCommandHandler(
            ILichHenRepository lichHenRepo,
            ILuotKhamRepository luotKhamRepo,
            IHoaDonRepository hoaDonRepo)
        {
            _lichHenRepo = lichHenRepo;
            _luotKhamRepo = luotKhamRepo;
            _hoaDonRepo = hoaDonRepo;
        }

        public async Task<TiepNhanLichHenResultDto> Handle(TiepNhanLichHenCommand request, CancellationToken cancellationToken)
        {
            var lichHen = await _lichHenRepo.GetByIdWithDetailsAsync(request.MaLichHen, cancellationToken)
                ?? throw new InvalidOperationException($"Không tìm thấy lịch hẹn #{request.MaLichHen}");

            if (lichHen.TrangThai == TrangThaiLichHen.DA_HUY)
            {
                throw new InvalidOperationException("Không thể tiếp nhận lịch hẹn đã bị hủy.");
            }

            if (lichHen.TrangThai == TrangThaiLichHen.DA_DEN || lichHen.TrangThai == TrangThaiLichHen.HOAN_THANH)
            {
                throw new InvalidOperationException("Lịch hẹn này đã được tiếp nhận vào khám trước đó.");
            }

            // Nếu chưa xác nhận thu tiền giữ chỗ 100k, tự động xác nhận thu tiền mặt tại quầy lúc tiếp nhận
            if (!lichHen.DaThanhToanGiuCho)
            {
                var ptCode = $"PT-LH{lichHen.Id:D6}";
                lichHen.XacNhanThuTienMat(ptCode, request.NguoiTiepNhan);
            }

            // 1. Phân loại Đúng giờ (±15 phút) hay Trễ hẹn (> 15 phút)
            var now = DateTime.Now;
            var appointmentStart = lichHen.ThoiGianBatDau;
            var lateMinutes = (now - appointmentStart).TotalMinutes;

            bool isFastTrack = true;
            string message = string.Empty;

            if (lateMinutes > 15)
            {
                isFastTrack = false;
                message = $"Bệnh nhân đến trễ {Math.Round(lateMinutes)} phút so với giờ hẹn ({appointmentStart:HH:mm}). Đã chuyển sang diện vãng lai và xếp vào cuối hàng đợi. Khoản 100.000đ đã được khấu trừ vào tiền khám.";
            }
            else
            {
                isFastTrack = true;
                message = $"Tiếp nhận thành công theo lịch hẹn ({appointmentStart:HH:mm}). Bệnh nhân được ưu tiên vị trí Fast-track trong hàng đợi. Tiền khám 100.000đ đã hoàn tất khấu trừ, bệnh nhân vào thẳng phòng khám.";
            }

            // 2. Lấy hàng đợi chờ khám của Bác sĩ trong ngày hôm nay
            var today = DateTime.UtcNow.Date;
            var waitingQueue = await _luotKhamRepo.GetQueryable()
                .Where(lk => !lk.IsDeleted
                    && lk.MaBacSi == lichHen.MaBacSi
                    && lk.TrangThai == TrangThaiLuotKham.CHO_KHAM
                    && lk.NgayKham == today)
                .OrderBy(lk => lk.SoThuTu ?? int.MaxValue)
                .ToListAsync(cancellationToken);

            int assignedSoThuTu;

            if (isFastTrack)
            {
                // Thuật toán hàng đợi công bằng:
                // Không cướp lượt của ca vãng lai đang chuẩn bị vào ngay kế tiếp (Vị trí 1).
                // Ca hẹn trước được chèn vào vị trí ngay sau ca chuẩn bị đó (Vị trí 2).
                if (waitingQueue.Count == 0)
                {
                    assignedSoThuTu = 1;
                }
                else if (waitingQueue.Count == 1)
                {
                    assignedSoThuTu = (waitingQueue[0].SoThuTu ?? 1) + 1;
                }
                else
                {
                    // Có từ 2 ca trở lên đang chờ:
                    // Ca đầu tiên (waitingQueue[0]) giữ nguyên vị trí 1.
                    // Ca hẹn chèn vào vị trí 2.
                    var firstPatientStt = waitingQueue[0].SoThuTu ?? 1;
                    assignedSoThuTu = firstPatientStt + 1;

                    // Tịnh tiến các ca từ vị trí 2 trở đi thêm 1 số thứ tự
                    foreach (var otherLk in waitingQueue.Skip(1))
                    {
                        var currentStt = otherLk.SoThuTu ?? assignedSoThuTu;
                        if (currentStt <= assignedSoThuTu)
                        {
                            SetSoThuTu(otherLk, assignedSoThuTu + 1);
                            assignedSoThuTu++;
                        }
                        else
                        {
                            SetSoThuTu(otherLk, currentStt + 1);
                        }
                        _luotKhamRepo.Update(otherLk);
                    }
                    assignedSoThuTu = firstPatientStt + 1;
                }
            }
            else
            {
                // Đến trễ: xếp xuống cuối hàng đợi
                var maxStt = waitingQueue.Count > 0 ? (waitingQueue.Max(x => x.SoThuTu) ?? 0) : 0;
                assignedSoThuTu = maxStt + 1;
            }

            // 3. Khởi tạo Lượt khám mới
            var maKhoa = lichHen.MaKhoa ?? 1;
            var luotKham = new LuotKhamEntity(
                lichHen.MaBenhNhan,
                lichHen.MaCoSo,
                maKhoa,
                assignedSoThuTu,
                lichHen.MaBacSi,
                lichHen.Id,
                null
            );

            await _luotKhamRepo.AddAsync(luotKham);
            // Lưu trước để có Id cho Hóa đơn
            await _luotKhamRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            // 4. Sinh Hóa Đơn 100.000 VNĐ & Phiếu Thu khấu trừ từ khoản cọc
            var soHoaDon = $"HD{DateTime.UtcNow:yyMMdd}{luotKham.Id:D4}";
            var hoaDon = new HoaDon(
                luotKham.Id,
                lichHen.MaBenhNhan,
                lichHen.MaCoSo,
                soHoaDon,
                request.NguoiTiepNhan,
                $"Tiền khám bệnh theo lịch hẹn #{lichHen.Id}"
            );

            hoaDon.AddServiceOrDrug("DICH_VU", 1, "Khám chuyên khoa theo lịch hẹn (Đã khấu trừ cọc)", 1, 100000m);
            hoaDon.RecordPayment(100000m, PhuongThucThanhToan.TIEN_MAT, request.NguoiTiepNhan, $"Khấu trừ tiền giữ chỗ lịch hẹn #{lichHen.Id} (Số PT cọc: {lichHen.SoPhieuThu})");

            await _hoaDonRepo.AddAsync(hoaDon);

            // 5. Cập nhật trạng thái Lịch hẹn -> DA_DEN
            lichHen.TiepNhanVaoKham();
            lichHen.MarkAsUpdated(request.NguoiTiepNhan);
            _lichHenRepo.Update(lichHen);

            await _lichHenRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new TiepNhanLichHenResultDto
            {
                MaLichHen = lichHen.Id,
                MaLuotKham = luotKham.Id,
                SoThuTu = assignedSoThuTu,
                MaHoaDon = hoaDon.Id,
                SoHoaDon = hoaDon.SoHoaDon,
                SoTienKhauTru = 100000m,
                UuTienFastTrack = isFastTrack,
                ThongBao = message
            };
        }

        private static void SetSoThuTu(LuotKhamEntity lk, int stt)
        {
            var prop = typeof(LuotKhamEntity).GetProperty(nameof(LuotKhamEntity.SoThuTu));
            prop?.SetValue(lk, stt);
        }
    }
}
