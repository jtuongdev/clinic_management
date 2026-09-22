using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayDanhSachDonThuocQueryHandler
        : IRequestHandler<LayDanhSachDonThuocQuery, PagedResult<DonThuocListDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayDanhSachDonThuocQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<PagedResult<DonThuocListDto>> Handle(LayDanhSachDonThuocQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _luotKhamRepo.GetDonThuocPagedAsync(
                request.PageIndex,
                request.PageSize,
                request.MaKhoa,
                request.MaBacSi,
                request.MaBenhNhan,
                request.TrangThai,
                request.FromDate,
                request.ToDate,
                cancellationToken
            );

            var dtos = items.Select(d => new DonThuocListDto
            {
                Id = d.Id,
                MaBenhNhanNoiBo = d.LuotKham.BenhNhan.BenhNhanCoSo.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                TenBenhNhan = $"{d.LuotKham.BenhNhan.Ho} {d.LuotKham.BenhNhan.Ten}",
                TenBacSi = d.BacSi?.HoTen ?? string.Empty,
                TenKhoa = d.LuotKham.Khoa?.Ten ?? string.Empty,
                TrangThai = d.TrangThai.ToString(),
                SoLuongThuoc = d.ChiTietDonThuocs?.Sum(ct => (int)ct.SoLuongKe) ?? 0,
                TongTien = d.ChiTietDonThuocs?.Sum(ct => ct.SoLuongKe * ct.DonGiaKe) ?? 0,
                NgayKe = d.NgayKe,
                NgayCapThuoc = d.NgayCapThuoc,
                MaLuotKham = d.MaLuotKham,
                MaBenhNhan = d.LuotKham.MaBenhNhan,
                MaBacSi = d.MaBacSi,
                MaCoSo = d.MaCoSo
            }).ToList();

            return new PagedResult<DonThuocListDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }
    }
}