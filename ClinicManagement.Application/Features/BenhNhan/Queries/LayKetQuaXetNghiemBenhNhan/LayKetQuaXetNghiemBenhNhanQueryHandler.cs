using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayKetQuaXetNghiemBenhNhanQueryHandler
        : IRequestHandler<LayKetQuaXetNghiemBenhNhanQuery, PagedResult<ChiDinhDichVuDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public LayKetQuaXetNghiemBenhNhanQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<PagedResult<ChiDinhDichVuDto>> Handle(
            LayKetQuaXetNghiemBenhNhanQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _benhNhanRepo.GetLabResultsByPatientIdAsync(
                request.PatientId,
                request.PageIndex,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(MapChiDinhDichVuToDto).ToList();

            return new PagedResult<ChiDinhDichVuDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }

        private ChiDinhDichVuDto MapChiDinhDichVuToDto(Domain.Service.ChiDinhDichVu entity)
        {
            return new ChiDinhDichVuDto
            {
                Id = entity.Id,
                TenDichVu = entity.DanhMucDichVu?.Ten ?? string.Empty,
                LoaiDichVu = entity.DanhMucDichVu?.LoaiDichVu.ToString() ?? string.Empty,
                TrangThai = entity.TrangThai.ToString(),
                NgayChiDinh = entity.NgayChiDinh,
                NgayThucHien = entity.NgayThucHien,
                NgayCoKetQua = entity.NgayCoKetQua,
                KetLuan = entity.KetLuan,
                UrlKetQua = entity.UrlKetQua,
                KetQuaChiTiet = entity.ChiTietKetQuaXetNghiems?
                    .Select(kq => new ChiTietKetQuaXetNghiemDto
                    {
                        TenChiSo = kq.TenChiSo,
                        GiaTri = kq.GiaTri,
                        DonVi = kq.DonVi,
                        KhoangThamChieu = kq.KhoangThamChieu,
                        BatThuong = kq.BatThuong
                    })
                    .ToList() ?? new System.Collections.Generic.List<ChiTietKetQuaXetNghiemDto>()
            };
        }
    }
}