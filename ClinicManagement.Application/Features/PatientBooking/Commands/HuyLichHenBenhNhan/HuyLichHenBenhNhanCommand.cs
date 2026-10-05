using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.PatientBooking.Commands.HuyLichHenBenhNhan
{
    public class HuyLichHenBenhNhanCommand : IRequest<LichHenDto>
    {
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public string LyDoHuy { get; set; } = string.Empty;
    }

    public class HuyLichHenBenhNhanCommandHandler : IRequestHandler<HuyLichHenBenhNhanCommand, LichHenDto>
    {
        private readonly ILichHenRepository _lichHenRepo;

        public HuyLichHenBenhNhanCommandHandler(ILichHenRepository lichHenRepo)
        {
            _lichHenRepo = lichHenRepo;
        }

        public async Task<LichHenDto> Handle(HuyLichHenBenhNhanCommand request, CancellationToken cancellationToken)
        {
            var lichHen = await _lichHenRepo.GetByIdWithDetailsAsync(request.AppointmentId, cancellationToken);
            if (lichHen == null || lichHen.MaBenhNhan != request.PatientId)
            {
                throw new KeyNotFoundException("Không tìm thấy lịch hẹn hoặc bạn không có quyền truy cập lịch hẹn này.");
            }

            if (lichHen.TrangThai == TrangThaiLichHen.DA_DEN || lichHen.TrangThai == TrangThaiLichHen.HOAN_THANH)
            {
                throw new InvalidOperationException("Không thể hủy lịch hẹn đã tiếp nhận hoặc đã hoàn thành khám.");
            }

            if (lichHen.TrangThai == TrangThaiLichHen.DA_HUY)
            {
                throw new InvalidOperationException("Lịch hẹn này đã bị hủy trước đó.");
            }

            // Quy định: Hủy trước giờ khám tối thiểu 2 tiếng
            const int minHoursBeforeAppointment = 2;
            var now = DateTime.Now;
            if (lichHen.ThoiGianBatDau <= now.AddHours(minHoursBeforeAppointment))
            {
                throw new InvalidOperationException(
                    $"Chỉ có thể hủy lịch hẹn trước giờ khám tối thiểu {minHoursBeforeAppointment} tiếng. " +
                    $"Lịch khám lúc {lichHen.ThoiGianBatDau:HH:mm dd/MM/yyyy}. Vui lòng liên hệ hotline phòng khám để được hỗ trợ kịp thời.");
            }

            var lyDo = string.IsNullOrWhiteSpace(request.LyDoHuy) ? "Bệnh nhân tự hủy qua ứng dụng" : request.LyDoHuy.Trim();
            lichHen.HuyLichHen($"[App Bệnh Nhân] {lyDo}");
            lichHen.MarkAsUpdated(request.PatientId);

            _lichHenRepo.Update(lichHen);
            await _lichHenRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new LichHenDto
            {
                Id = lichHen.Id,
                MaBenhNhan = lichHen.MaBenhNhan,
                TenBenhNhan = lichHen.BenhNhan != null ? $"{lichHen.BenhNhan.Ho} {lichHen.BenhNhan.Ten}".Trim() : string.Empty,
                SoDienThoai = lichHen.BenhNhan?.DienThoai ?? string.Empty,
                SoCCCD = lichHen.BenhNhan?.SoCCCD ?? string.Empty,
                NgaySinh = lichHen.BenhNhan?.NgaySinh,
                GioiTinh = lichHen.BenhNhan?.GioiTinh.ToString() ?? string.Empty,
                DiaChi = lichHen.BenhNhan?.DiaChi ?? string.Empty,
                MaBacSi = lichHen.MaBacSi,
                TenBacSi = lichHen.BacSi?.HoTen ?? string.Empty,
                MaCoSo = lichHen.MaCoSo,
                TenCoSo = lichHen.CoSo?.Ten ?? string.Empty,
                MaKhoa = lichHen.MaKhoa,
                TenKhoa = lichHen.Khoa?.Ten ?? string.Empty,
                ThoiGianBatDau = lichHen.ThoiGianBatDau,
                ThoiGianKetThuc = lichHen.ThoiGianKetThuc,
                TrangThai = lichHen.TrangThai.ToString(),
                TrangThaiText = lichHen.TrangThai.ToString(),
                LyDo = lichHen.LyDo,
                NguonDat = lichHen.NguonDat,
                ChiPhiGiuCho = lichHen.ChiPhiGiuCho,
                DaThanhToanGiuCho = lichHen.DaThanhToanGiuCho,
                GhiChuHuy = lichHen.GhiChuHuy,
                CreatedAt = lichHen.CreatedAt
            };
        }
    }
}
