using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhanProfileQueryHandler
        : IRequestHandler<GetBenhNhanProfileQuery, BenhNhanProfileDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public GetBenhNhanProfileQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<BenhNhanProfileDto> Handle(
            GetBenhNhanProfileQuery request,
            CancellationToken cancellationToken)
        {
            var benhNhan = await _benhNhanRepo.GetPatientProfileAsync(request.Id, cancellationToken);
            if (benhNhan == null)
                throw new KeyNotFoundException($"Không tìm thấy bệnh nhân với Id = {request.Id}");

            // 
            var dto = new BenhNhanProfileDto
            {
                Id = benhNhan.Id,
                Ho = benhNhan.Ho,
                Ten = benhNhan.Ten,
                NgaySinh = benhNhan.NgaySinh,
                GioiTinh = benhNhan.GioiTinh.ToString(),
                DienThoai = benhNhan.DienThoai,
                Email = benhNhan.Email,
                SoCCCD = benhNhan.SoCCCD,
                DiaChi = benhNhan.DiaChi,
                NguoiLienHeTen = benhNhan.NguoiLienHeTen,
                NguoiLienHeDienThoai = benhNhan.NguoiLienHeDienThoai,
                CreatedAt = benhNhan.CreatedAt,
                IsDeleted = benhNhan.IsDeleted,

                // Thông tin cơ sở
                MaBenhNhanNoiBo = benhNhan.BenhNhanCoSo.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                MaCoSo = benhNhan.BenhNhanCoSo.FirstOrDefault()?.MaCoSo ?? 0,
                TenCoSo = benhNhan.BenhNhanCoSo.FirstOrDefault()?.CoSo?.Ten ?? string.Empty,
                NgayDangKy = benhNhan.BenhNhanCoSo.FirstOrDefault()?.NgayDangKy ?? DateTime.MinValue,

                // Tài khoản
                TaiKhoan = new TaiKhoanDto
                {
                    Username = benhNhan.Username ?? string.Empty,
                    HasPassword = !string.IsNullOrEmpty(benhNhan.PasswordHash),
                    LastLogin = null,
                    IsLocked = false,
                    Roles = new System.Collections.Generic.List<string>()
                },

                // Người tạo 
                NguoiTao = null,

                // Các danh sách
                BaoHiems = benhNhan.BaoHiems?.Select(b => new BaoHiemDto
                {
                    Id = b.Id,
                    LoaiBaoHiem = b.LoaiBaoHiem.ToString(),
                    TenNhaCungCap = b.TenNhaCungCap,
                    SoThe = b.SoThe,
                    NgayBatDau = b.NgayBatDau,
                    NgayKetThuc = b.NgayKetThuc,
                    MucHuong = b.MucHuong,
                    IsValid = b.IsValid()
                }).ToList() ?? new System.Collections.Generic.List<BaoHiemDto>(),

                TienSuBenhs = benhNhan.TienSuBenhs?.Select(t => new TienSuBenhDto
                {
                    Id = t.Id,
                    LoaiTienSu = t.LoaiTienSu.ToString(),
                    Ten = t.Ten,
                    GhiChu = t.GhiChu,
                    NgayGhiNhan = t.NgayGhiNhan
                }).ToList() ?? new System.Collections.Generic.List<TienSuBenhDto>(),

                LuotKhamGanNhat = benhNhan.LuotKhams?
                    .Where(l => !l.IsDeleted)
                    .OrderByDescending(l => l.NgayKham)
                    .Take(5)
                    .Select(l => new LuotKhamSummaryDto
                    {
                        Id = l.Id,
                        NgayKham = l.NgayKham,
                        TrangThai = l.TrangThai.ToString(),
                        BacSi = l.BacSi?.HoTen ?? string.Empty,
                        Khoa = l.Khoa?.Ten ?? string.Empty,
                        LyDoKham = l.LyDoKham,
                        ChanDoanChinh = l.ChanDoans?.FirstOrDefault(c => c.LaChanDoanChinh)?.TenChanDoan ?? string.Empty
                    })
                    .ToList() ?? new System.Collections.Generic.List<LuotKhamSummaryDto>(),

                HoaDonGanNhat = benhNhan.HoaDons?
                    .Where(h => !h.IsDeleted)
                    .OrderByDescending(h => h.NgayLap)
                    .Take(5)
                    .Select(h => new HoaDonSummaryDto
                    {
                        Id = h.Id,
                        SoHoaDon = h.SoHoaDon,
                        NgayLap = h.NgayLap,
                        TongTien = h.TongTien,
                        DaThanhToan = h.DaThanhToan,
                        TrangThai = h.TrangThai.ToString()
                    })
                    .ToList() ?? new System.Collections.Generic.List<HoaDonSummaryDto>()
            };

            // thong ke 
            var allVisits = await _benhNhanRepo.GetVisitsByPatientIdAsync(
                request.Id, 1, int.MaxValue, null, null, null, cancellationToken);

            var allInvoices = await _benhNhanRepo.GetInvoicesByPatientIdAsync(
                request.Id, 1, int.MaxValue, null, cancellationToken);

            decimal tongDaThanhToan = allInvoices.Items.Sum(h => h.DaThanhToan);
            decimal tongConNo = allInvoices.Items.Sum(h => h.TongTien - h.DaThanhToan);

            dto.ThongTinTongQuan = new ThongTinTongQuanDto
            {
                TongLuotKham = allVisits.Items.Count,
                TongHoaDon = allInvoices.Items.Count,
                TongTienDaThanhToan = tongDaThanhToan,
                TongTienConNo = tongConNo,
                SoLanKhamGanNhat = 0,
                TrangThaiHienTai = benhNhan.LuotKhams
                    .OrderByDescending(l => l.NgayKham)
                    .FirstOrDefault()?.TrangThai.ToString() ?? "Chưa có"
            };

            return dto;
        }
    }
}