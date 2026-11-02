using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayLuotKhamTheoIdQueryHandler
        : IRequestHandler<LayLuotKhamTheoIdQuery, LuotKhamDetailDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayLuotKhamTheoIdQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<LuotKhamDetailDto> Handle(
            LayLuotKhamTheoIdQuery request,
            CancellationToken cancellationToken)
        {
            var luotKham = await _luotKhamRepo.GetDetailByIdAsync(request.Id);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám với Id = {request.Id}");

            return MapToDetailDto(luotKham);
        }

        private LuotKhamDetailDto MapToDetailDto(Domain.Examination.LuotKham entity)
        {
            return new LuotKhamDetailDto
            {
                Id = entity.Id,
                MaBenhNhan = entity.MaBenhNhan,
                TenBenhNhan = entity.BenhNhan != null ? $"{entity.BenhNhan.Ho} {entity.BenhNhan.Ten}" : string.Empty,
                MaBenhNhanNoiBo = entity.BenhNhan?.BenhNhanCoSo?.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                MaBacSi = entity.MaBacSi,
                TenBacSi = entity.BacSi?.HoTen ?? string.Empty,
                ChuyenKhoaBacSi = entity.BacSi?.ChuyenKhoa ?? string.Empty,
                MaKhoa = entity.MaKhoa,
                TenKhoa = entity.Khoa?.Ten ?? string.Empty,
                MaCoSo = entity.MaCoSo,
                TenCoSo = entity.CoSo?.Ten ?? string.Empty,
                TrangThai = entity.TrangThai.ToString(),
                HinhThucDieuTri = entity.HinhThucDieuTri.ToString(),
                SoThuTu = entity.SoThuTu,
                NgayKham = entity.NgayKham,
                ThoiGianBatDauKham = entity.ThoiGianBatDauKham,
                ThoiGianKetThucKham = entity.ThoiGianKetThucKham,
                LyDoKham = entity.LyDoKham,
                TenPhongKham = entity.PhongKham?.Ten ?? string.Empty,
                MaLichHen = entity.MaLichHen,
                LichHenThoiGian = entity.LichHen != null
                    ? $"{entity.LichHen.ThoiGianBatDau:dd/MM/yyyy HH:mm} - {entity.LichHen.ThoiGianKetThuc:HH:mm}"
                    : null,
                CreatedAt = entity.CreatedAt,
                IsDeleted = entity.IsDeleted,

                ChanDoans = entity.ChanDoans?
                    .Where(c => !c.IsDeleted)
                    .Select(c => new ChanDoanDto
                    {
                        Id = c.Id,
                        MaICD = c.MaICD,
                        TenICD = c.ICD?.TenICD ?? string.Empty,
                        TenChanDoan = c.TenChanDoan,
                        LaChanDoanChinh = c.LaChanDoanChinh,
                        GhiChu = c.GhiChu
                    }).ToList() ?? new List<ChanDoanDto>(),

                SinhHieu = entity.SinhHieus?
                    .OrderByDescending(s => s.ThoiDiemDo)
                    .Select(s => new SinhHieuDto
                    {
                        HuyetApTamThu = s.HuyetApTamThu,
                        HuyetApTamTruong = s.HuyetApTamTruong,
                        Mach = s.Mach,
                        NhietDo = s.NhietDo,
                        CanNang = s.CanNang,
                        ChieuCao = s.ChieuCao,
                        SpO2 = s.SpO2,
                        ThoiDiemDo = s.ThoiDiemDo
                    })
                    .FirstOrDefault(),

                ChiDinhDichVus = entity.ChiDinhDichVus?
                    .Where(cd => !cd.IsDeleted)
                    .OrderByDescending(cd => cd.NgayChiDinh)
                    .Select(cd => new ChiDinhDichVuDto
                    {
                        Id = cd.Id,
                        TenDichVu = cd.DanhMucDichVu?.Ten ?? string.Empty,
                        LoaiDichVu = cd.DanhMucDichVu?.LoaiDichVu.ToString() ?? string.Empty,
                        TrangThai = cd.TrangThai.ToString(), 
                        NgayChiDinh = cd.NgayChiDinh,
                        NgayThucHien = cd.NgayThucHien,
                        NgayCoKetQua = cd.NgayCoKetQua,
                        KetLuan = cd.KetLuan ?? string.Empty,
                        UrlKetQua = cd.UrlKetQua ?? string.Empty,
                        KetQuaChiTiet = cd.ChiTietKetQuaXetNghiems?
                            .Select(kq => new ChiTietKetQuaXetNghiemDto
                            {
                                TenChiSo = kq.TenChiSo,
                                GiaTri = kq.GiaTri,
                                DonVi = kq.DonVi,
                                KhoangThamChieu = kq.KhoangThamChieu,
                                BatThuong = kq.BatThuong
                            }).ToList() ?? new List<ChiTietKetQuaXetNghiemDto>()
                    }).ToList() ?? new List<ChiDinhDichVuDto>(),

                DonThuocs = entity.DonThuocs?
                    .Where(d => !d.IsDeleted)
                    .OrderByDescending(d => d.NgayKe)
                    .Select(d => new DonThuocDto
                    {
                        Id = d.Id,
                        NgayKe = d.NgayKe,
                        TrangThai = d.TrangThai.ToString(),
                        GhiChu = d.GhiChu ?? string.Empty,
                        ChiTiet = d.ChiTietDonThuocs?
                            .Select(ct => new ChiTietDonThuocDto
                            {
                                TenThuoc = ct.Item?.Ten ?? string.Empty,
                                DonViTinh = ct.Item?.DonViTinhCoBan ?? string.Empty,
                                SoLuongKe = ct.SoLuongKe,
                                SoLuongDaXuat = ct.SoLuongDaXuat,
                                LieuDung = ct.LieuDung ?? string.Empty,
                                TanSuat = ct.TanSuat ?? string.Empty,
                                SoNgay = ct.SoNgay,
                                HuongDan = ct.HuongDan ?? string.Empty,
                                DonGia = ct.DonGiaKe
                            }).ToList() ?? new List<ChiTietDonThuocDto>()
                    }).ToList() ?? new List<DonThuocDto>()
            };
        }
    }
}