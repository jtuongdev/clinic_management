using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LichHen.Queries.LayDanhSachLichHen
{
    public class LayDanhSachLichHenQuery : IRequest<PagedResult<LichHenDto>>
    {
        public int? MaCoSo { get; set; }
        public int? MaBacSi { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public string? TrangThai { get; set; }
        public string? Keyword { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 15;
    }

    public class LayDanhSachLichHenQueryHandler : IRequestHandler<LayDanhSachLichHenQuery, PagedResult<LichHenDto>>
    {
        private readonly ILichHenRepository _lichHenRepo;
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayDanhSachLichHenQueryHandler(ILichHenRepository lichHenRepo, ILuotKhamRepository luotKhamRepo)
        {
            _lichHenRepo = lichHenRepo;
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<PagedResult<LichHenDto>> Handle(LayDanhSachLichHenQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _lichHenRepo.GetPagedAppointmentsAsync(
                request.MaCoSo,
                request.MaBacSi,
                request.TuNgay,
                request.DenNgay,
                request.TrangThai,
                request.Keyword,
                request.PageIndex,
                request.PageSize,
                cancellationToken);

            // Tìm các lượt khám liên kết nếu có
            var lichHenIds = items.Select(i => i.Id).ToList();
            var luotKhams = await _luotKhamRepo.GetQueryable()
                .AsNoTracking()
                .Where(lk => lk.MaLichHen.HasValue && lichHenIds.Contains(lk.MaLichHen.Value) && !lk.IsDeleted)
                .Select(lk => new { lk.Id, lk.MaLichHen, lk.SoThuTu })
                .ToListAsync(cancellationToken);

            var lkDict = luotKhams.ToDictionary(k => k.MaLichHen!.Value, v => v);

            var dtos = items.Select(item =>
            {
                lkDict.TryGetValue(item.Id, out var linkedLk);

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
                    GhiChuHuy = item.GhiChuHuy,

                    MaLuotKham = linkedLk?.Id,
                    SoThuTuHangDoi = linkedLk?.SoThuTu,
                    CreatedAt = item.CreatedAt
                };
            }).ToList();

            return new PagedResult<LichHenDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }
    }
}
