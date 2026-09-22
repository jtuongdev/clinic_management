using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayDanhSachChiDinhDichVuQueryHandler
        : IRequestHandler<LayDanhSachChiDinhDichVuQuery, PagedResult<ChiDinhDichVuListDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayDanhSachChiDinhDichVuQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<PagedResult<ChiDinhDichVuListDto>> Handle(LayDanhSachChiDinhDichVuQuery request, CancellationToken cancellationToken)
        {
            var (luotKhams, totalCount) = await _luotKhamRepo.GetChiDinhDichVuPagedAsync(
                request.PageIndex,
                request.PageSize,
                request.MaKhoa,
                request.MaBacSi,
                request.MaBenhNhan,
                request.LoaiDichVu,
                request.TrangThai,
                request.FromDate,
                request.ToDate,
                cancellationToken
            );

            var dtoItems = luotKhams
                .SelectMany(lk => (lk.ChiDinhDichVus ?? new System.Collections.Generic.List<Domain.Service.ChiDinhDichVu>())
                    .Where(cd => !cd.IsDeleted)
                    .Select(cd => new ChiDinhDichVuListDto
                    {
                        Id = cd.Id,
                        MaBenhNhanNoiBo = lk.BenhNhan?.BenhNhanCoSo?.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                        TenBenhNhan = lk.BenhNhan != null ? $"{lk.BenhNhan.Ho} {lk.BenhNhan.Ten}" : string.Empty,
                        LoaiDichVu = cd.DanhMucDichVu?.LoaiDichVu.ToString() ?? string.Empty,
                        TenBacSiChiDinh = cd.BacSiChiDinh?.HoTen ?? lk.BacSi?.HoTen ?? string.Empty,
                        TenKhoa = lk.Khoa?.Ten ?? string.Empty,
                        NgayChiDinh = cd.NgayChiDinh,
                        TrangThai = cd.TrangThai.ToString(),
                        MaBenhNhan = lk.MaBenhNhan,
                        MaKhoa = lk.MaKhoa,
                        MaBacSiChiDinh = cd.MaBacSiChiDinh,
                        MaDanhMucDichVu = cd.MaDanhMuc,
                        TenDichVu = cd.DanhMucDichVu?.Ten ?? string.Empty
                    }))
                .ToList();

            return new PagedResult<ChiDinhDichVuListDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtoItems
            };
        }
    }
}
