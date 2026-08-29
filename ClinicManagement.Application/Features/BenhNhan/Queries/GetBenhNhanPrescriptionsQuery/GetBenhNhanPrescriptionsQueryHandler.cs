using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhanPrescriptionsQueryHandler
        : IRequestHandler<GetBenhNhanPrescriptionsQuery, PagedResult<DonThuocDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public GetBenhNhanPrescriptionsQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<PagedResult<DonThuocDto>> Handle(
            GetBenhNhanPrescriptionsQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _benhNhanRepo.GetPrescriptionsByPatientIdAsync(
                request.PatientId,
                request.PageIndex,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(MapDonThuocToDto).ToList();

            return new PagedResult<DonThuocDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }

        private DonThuocDto MapDonThuocToDto(Domain.Prescription.DonThuoc entity)
        {
            return new DonThuocDto
            {
                Id = entity.Id,
                NgayKe = entity.NgayKe,
                TrangThai = entity.TrangThai.ToString(),
                GhiChu = entity.GhiChu,
                ChiTiet = entity.ChiTietDonThuocs?
                    .Where(ct => !ct.IsDeleted)
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
            };
        }
    }
}