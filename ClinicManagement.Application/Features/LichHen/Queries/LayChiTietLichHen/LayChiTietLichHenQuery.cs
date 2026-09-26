using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LichHen.Queries.LayChiTietLichHen
{
    public class LayChiTietLichHenQuery : IRequest<LichHenDto?>
    {
        public int Id { get; set; }

        public LayChiTietLichHenQuery(int id)
        {
            Id = id;
        }
    }

    public class LayChiTietLichHenQueryHandler : IRequestHandler<LayChiTietLichHenQuery, LichHenDto?>
    {
        private readonly ILichHenRepository _lichHenRepo;
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayChiTietLichHenQueryHandler(
            ILichHenRepository lichHenRepo,
            INhanVienRepository nhanVienRepo,
            ILuotKhamRepository luotKhamRepo)
        {
            _lichHenRepo = lichHenRepo;
            _nhanVienRepo = nhanVienRepo;
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<LichHenDto?> Handle(LayChiTietLichHenQuery request, CancellationToken cancellationToken)
        {
            var item = await _lichHenRepo.GetByIdWithDetailsAsync(request.Id, cancellationToken);
            if (item == null) return null;

            // Lấy thông tin người thu tiền nếu có
            string? tenNguoiThu = null;
            if (item.NguoiThuTien.HasValue && item.NguoiThuTien.Value > 0)
            {
                var thuNgan = await _nhanVienRepo.GetByIdAsync(item.NguoiThuTien.Value);
                tenNguoiThu = thuNgan?.HoTen;
            }

            // Lấy thông tin lượt khám nếu đã tiếp nhận
            var linkedLk = await _luotKhamRepo.GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(lk => lk.MaLichHen == item.Id && !lk.IsDeleted, cancellationToken);

            string statusText = item.TrangThai switch
            {
                TrangThaiLichHen.CHO_XAC_NHAN => "Chờ thu tiền giữ chỗ",
                TrangThaiLichHen.DA_XAC_NHAN => "Đã giữ chỗ",
                TrangThaiLichHen.DA_DEN => "Đã tiếp nhận khám",
                TrangThaiLichHen.DA_HUY => "Đã hủy",
                TrangThaiLichHen.HOAN_THANH => "Hoàn thành",
                _ => item.TrangThai.ToString()
            };

            return new LichHenDto
            {
                Id = item.Id,
                MaBenhNhan = item.MaBenhNhan,
                TenBenhNhan = $"{item.BenhNhan?.Ho ?? ""} {item.BenhNhan?.Ten ?? ""}".Trim(),
                SoDienThoai = item.BenhNhan?.DienThoai ?? string.Empty,
                SoCCCD = item.BenhNhan?.SoCCCD ?? string.Empty,
                NgaySinh = item.BenhNhan?.NgaySinh,
                GioiTinh = item.BenhNhan?.GioiTinh.ToString() ?? string.Empty,
                DiaChi = item.BenhNhan?.DiaChi ?? string.Empty,

                MaBacSi = item.MaBacSi,
                TenBacSi = item.BacSi?.HoTen ?? string.Empty,
                MaKhoa = item.MaKhoa,
                TenKhoa = item.Khoa?.Ten ?? string.Empty,
                MaCoSo = item.MaCoSo,
                TenCoSo = item.CoSo?.Ten ?? string.Empty,

                ThoiGianBatDau = item.ThoiGianBatDau,
                ThoiGianKetThuc = item.ThoiGianKetThuc,
                TrangThai = item.TrangThai.ToString(),
                TrangThaiText = statusText,
                LyDo = item.LyDo,
                NguonDat = item.NguonDat,

                ChiPhiGiuCho = item.ChiPhiGiuCho,
                DaThanhToanGiuCho = item.DaThanhToanGiuCho,
                SoPhieuThu = item.SoPhieuThu,
                NgayThanhToan = item.NgayThanhToan,
                NguoiThuTien = item.NguoiThuTien,
                TenNguoiThuTien = tenNguoiThu,
                GhiChuHuy = item.GhiChuHuy,

                MaLuotKham = linkedLk?.Id,
                SoThuTuHangDoi = linkedLk?.SoThuTu,
                CreatedAt = item.CreatedAt
            };
        }
    }
}
