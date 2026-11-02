using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LichHen.Commands.HuyLichHen
{
    public class HuyLichHenCommand : IRequest<LichHenDto>
    {
        public int MaLichHen { get; set; }
        public string LyDoHuy { get; set; } = string.Empty;
        public int? NguoiHuy { get; set; }
    }

    public class HuyLichHenCommandHandler : IRequestHandler<HuyLichHenCommand, LichHenDto>
    {
        private readonly ILichHenRepository _lichHenRepo;

        public HuyLichHenCommandHandler(ILichHenRepository lichHenRepo)
        {
            _lichHenRepo = lichHenRepo;
        }

        public async Task<LichHenDto> Handle(HuyLichHenCommand request, CancellationToken cancellationToken)
        {
            var lichHen = await _lichHenRepo.GetByIdWithDetailsAsync(request.MaLichHen, cancellationToken)
                ?? throw new InvalidOperationException($"Không tìm thấy lịch hẹn #{request.MaLichHen}");

            if (lichHen.TrangThai == TrangThaiLichHen.DA_DEN || lichHen.TrangThai == TrangThaiLichHen.HOAN_THANH)
            {
                throw new InvalidOperationException("Không thể hủy lịch hẹn đã tiếp nhận hoặc đã hoàn thành khám.");
            }

            if (lichHen.TrangThai == TrangThaiLichHen.DA_HUY)
            {
                throw new InvalidOperationException("Lịch hẹn này đã bị hủy trước đó.");
            }

            // Thực hiện hủy lịch hẹn
            // CHÍNH SÁCH QUY ĐỊNH: Khoản 100.000 VNĐ tiền cọc KHÔNG HOÀN LẠI trong mọi trường hợp hủy hoặc no-show
            // Tuyệt đối không sinh phiếu chi hoàn tiền.
            lichHen.HuyLichHen(request.LyDoHuy);
            if (request.NguoiHuy.HasValue && request.NguoiHuy.Value > 0)
            {
                lichHen.MarkAsUpdated(request.NguoiHuy.Value);
            }

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
                MaKhoa = lichHen.MaKhoa,
                TenKhoa = lichHen.Khoa?.Ten ?? string.Empty,
                MaCoSo = lichHen.MaCoSo,
                TenCoSo = lichHen.CoSo?.Ten ?? string.Empty,

                ThoiGianBatDau = lichHen.ThoiGianBatDau,
                ThoiGianKetThuc = lichHen.ThoiGianKetThuc,
                TrangThai = lichHen.TrangThai.ToString(),
                TrangThaiText = "Đã hủy (Không hoàn cọc)",
                LyDo = lichHen.LyDo,
                NguonDat = lichHen.NguonDat,

                ChiPhiGiuCho = lichHen.ChiPhiGiuCho,
                DaThanhToanGiuCho = lichHen.DaThanhToanGiuCho,
                SoPhieuThu = lichHen.SoPhieuThu,
                NgayThanhToan = lichHen.NgayThanhToan,
                NguoiThuTien = lichHen.NguoiThuTien,
                GhiChuHuy = lichHen.GhiChuHuy,

                CreatedAt = lichHen.CreatedAt
            };
        }
    }
}
