using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhanInvoicesQueryHandler
        : IRequestHandler<GetBenhNhanInvoicesQuery, PagedResult<HoaDonDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public GetBenhNhanInvoicesQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<PagedResult<HoaDonDto>> Handle(
            GetBenhNhanInvoicesQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _benhNhanRepo.GetInvoicesByPatientIdAsync(
                request.PatientId,
                request.PageIndex,
                request.PageSize,
                request.Status,
                cancellationToken);

            var dtos = items.Select(MapHoaDonToDto).ToList();

            return new PagedResult<HoaDonDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }

        private HoaDonDto MapHoaDonToDto(Domain.Billing.HoaDon entity)
        {
            return new HoaDonDto
            {
                Id = entity.Id,
                SoHoaDon = entity.SoHoaDon,
                NgayLap = entity.NgayLap,
                TongTien = entity.TongTien,
                SoTienBaoHiemChiTra = entity.SoTienBaoHiemChiTra,
                SoTienBenhNhanChiTra = entity.SoTienBenhNhanChiTra,
                DaThanhToan = entity.DaThanhToan,
                TrangThai = entity.TrangThai.ToString(),
                GhiChu = entity.GhiChu,

                ChiTiet = entity.ChiTietHoaDons?
                    .Select(ct => new ChiTietHoaDonDto
                    {
                        Id = ct.Id,
                        LoaiDoiTuong = ct.LoaiDoiTuong,
                        MoTa = ct.MoTa,
                        SoLuong = ct.SoLuong,
                        DonGia = ct.DonGia,
                        ThanhTien = ct.ThanhTien
                    })
                    .ToList() ?? new System.Collections.Generic.List<ChiTietHoaDonDto>(),

                PhieuThus = entity.PhieuThus?
                    .Select(p => new PhieuThuDto
                    {
                        Id = p.Id,
                        SoPhieuThu = p.SoPhieuThu,
                        SoTien = p.SoTien,
                        NgayThu = p.NgayThu,
                        PhuongThuc = p.PhuongThuc.ToString(),
                        NguoiThu = p.NguoiThu?.HoTen ?? string.Empty,
                        GhiChu = p.GhiChu
                    })
                    .ToList() ?? new System.Collections.Generic.List<PhieuThuDto>(),

                CongNo = entity.CongNoBenhNhan != null ? new CongNoDto
                {
                    SoTienNo = entity.CongNoBenhNhan.SoTienNo,
                    SoTienDaTra = entity.CongNoBenhNhan.SoTienDaTra,
                    SoTienConLai = entity.CongNoBenhNhan.SoTienConLai,
                    TrangThai = entity.CongNoBenhNhan.TrangThai.ToString(),
                    HanThanhToan = entity.CongNoBenhNhan.HanThanhToan
                } : null
            };
        }
    }
}