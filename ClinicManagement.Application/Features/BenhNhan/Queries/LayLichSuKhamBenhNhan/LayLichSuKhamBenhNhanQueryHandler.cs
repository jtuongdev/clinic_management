using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayLichSuKhamBenhNhanQueryHandler
        : IRequestHandler<LayLichSuKhamBenhNhanQuery, PagedResult<LuotKhamDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public LayLichSuKhamBenhNhanQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<PagedResult<LuotKhamDto>> Handle(
            LayLichSuKhamBenhNhanQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _benhNhanRepo.GetVisitsByPatientIdAsync(
                request.PatientId,
                request.PageIndex,
                request.PageSize,
                request.Status,
                request.FromDate,
                request.ToDate,
                cancellationToken);

            var dtos = items.Select(MapLuotKhamToDto).ToList();

            return new PagedResult<LuotKhamDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }

        private LuotKhamDto MapLuotKhamToDto(Domain.Examination.LuotKham entity)
        {
            return new LuotKhamDto
            {
                Id = entity.Id,
                NgayKham = entity.NgayKham,
                TrangThai = entity.TrangThai.ToString(),
                HinhThucDieuTri = entity.HinhThucDieuTri.ToString(),
                LyDoKham = entity.LyDoKham,
                TenPhongKham = entity.PhongKham?.Ten ?? string.Empty,
                ThoiGianBatDauKham = entity.ThoiGianBatDauKham,
                ThoiGianKetThucKham = entity.ThoiGianKetThucKham,

                BacSi = entity.BacSi?.HoTen ?? string.Empty,
                ChuyenKhoaBacSi = entity.BacSi?.ChuyenKhoa ?? string.Empty,
                Khoa = entity.Khoa?.Ten ?? string.Empty,

                ChanDoans = entity.ChanDoans?
                    .Where(c => !c.IsDeleted)
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new ChanDoanDto
                    {
                        Id = c.Id,
                        MaICD = c.MaICD,
                        TenICD = c.ICD?.TenICD ?? string.Empty,
                        TenChanDoan = c.TenChanDoan,
                        LaChanDoanChinh = c.LaChanDoanChinh,
                        GhiChu = c.GhiChu
                    })
                    .ToList() ?? new System.Collections.Generic.List<ChanDoanDto>(),

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
                        KetLuan = cd.KetLuan,
                        UrlKetQua = cd.UrlKetQua,
                        KetQuaChiTiet = cd.ChiTietKetQuaXetNghiems?
                            .Select(kq => new ChiTietKetQuaXetNghiemDto
                            {
                                TenChiSo = kq.TenChiSo,
                                GiaTri = kq.GiaTri,
                                DonVi = kq.DonVi,
                                KhoangThamChieu = kq.KhoangThamChieu,
                                BatThuong = kq.BatThuong
                            })
                            .ToList() ?? new System.Collections.Generic.List<ChiTietKetQuaXetNghiemDto>()
                    })
                    .ToList() ?? new System.Collections.Generic.List<ChiDinhDichVuDto>(),

                DonThuocs = entity.DonThuocs?
                    .Where(d => !d.IsDeleted)
                    .OrderByDescending(d => d.NgayKe)
                    .Select(d => new DonThuocDto
                    {
                        Id = d.Id,
                        NgayKe = d.NgayKe,
                        TrangThai = d.TrangThai.ToString(),
                        GhiChu = d.GhiChu,
                        ChiTiet = d.ChiTietDonThuocs?
                            .Select(ct => new ChiTietDonThuocDto
                            {
                                TenThuoc = ct.Item?.Ten ?? string.Empty,
                                DonViTinh = ct.Item?.DonViTinhCoBan ?? string.Empty,
                                SoLuongKe = ct.SoLuongKe,
                                SoLuongDaXuat = ct.SoLuongDaXuat,
                                LieuDung = ct.LieuDung,
                                TanSuat = ct.TanSuat,
                                SoNgay = ct.SoNgay,
                                HuongDan = ct.HuongDan,
                                DonGia = ct.DonGiaKe
                            })
                            .ToList() ?? new System.Collections.Generic.List<ChiTietDonThuocDto>()
                    })
                    .ToList() ?? new System.Collections.Generic.List<DonThuocDto>()
            };
        }
    }
}