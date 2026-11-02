using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LichHen.Commands.XacNhanThuTienMat
{
    public class XacNhanThuTienMatCommand : IRequest<LichHenDto>
    {
        public int MaLichHen { get; set; }
        public int NguoiThu { get; set; }
        public string? GhiChu { get; set; }
    }

    public class XacNhanThuTienMatCommandHandler : IRequestHandler<XacNhanThuTienMatCommand, LichHenDto>
    {
        private readonly ILichHenRepository _lichHenRepo;
        private readonly INhanVienRepository _nhanVienRepo;

        public XacNhanThuTienMatCommandHandler(ILichHenRepository lichHenRepo, INhanVienRepository nhanVienRepo)
        {
            _lichHenRepo = lichHenRepo;
            _nhanVienRepo = nhanVienRepo;
        }

        public async Task<LichHenDto> Handle(XacNhanThuTienMatCommand request, CancellationToken cancellationToken)
        {
            var lichHen = await _lichHenRepo.GetByIdWithDetailsAsync(request.MaLichHen, cancellationToken)
                ?? throw new InvalidOperationException($"Không tìm thấy lịch hẹn #{request.MaLichHen}");

            if (lichHen.TrangThai == TrangThaiLichHen.DA_HUY)
            {
                throw new InvalidOperationException("Không thể thu tiền cho lịch hẹn đã bị hủy.");
            }

            if (lichHen.DaThanhToanGiuCho)
            {
                throw new InvalidOperationException($"Lịch hẹn #{request.MaLichHen} đã được thanh toán trước đó (Số PT: {lichHen.SoPhieuThu}).");
            }

            // Sinh mã phiếu thu tiền mặt cố định 100.000 VNĐ
            var soPhieuThu = $"PT-LH{lichHen.Id:D6}";
            lichHen.XacNhanThuTienMat(soPhieuThu, request.NguoiThu);

            _lichHenRepo.Update(lichHen);
            await _lichHenRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            var thuNgan = await _nhanVienRepo.GetByIdAsync(request.NguoiThu);

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
                TrangThaiText = "Đã giữ chỗ",
                LyDo = lichHen.LyDo,
                NguonDat = lichHen.NguonDat,

                ChiPhiGiuCho = lichHen.ChiPhiGiuCho,
                DaThanhToanGiuCho = lichHen.DaThanhToanGiuCho,
                SoPhieuThu = lichHen.SoPhieuThu,
                NgayThanhToan = lichHen.NgayThanhToan,
                NguoiThuTien = lichHen.NguoiThuTien,
                TenNguoiThuTien = thuNgan?.HoTen,

                CreatedAt = lichHen.CreatedAt
            };
        }
    }
}
