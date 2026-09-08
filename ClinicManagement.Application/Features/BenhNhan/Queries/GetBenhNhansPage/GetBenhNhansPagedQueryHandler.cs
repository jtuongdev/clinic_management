using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using Microsoft.EntityFrameworkCore; // Bắt buộc phải có để dùng Skip, Take, ToListAsync
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhansPagedQueryHandler : IRequestHandler<GetBenhNhansPagedQuery, PagedResult<BenhNhanDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public GetBenhNhansPagedQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<PagedResult<BenhNhanDto>> Handle(GetBenhNhansPagedQuery request, CancellationToken cancellationToken)
        {
            var query = _benhNhanRepo.GetQueryable();

            // Lọc theo từ khóa
            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(b =>
                    b.Ho.ToLower().Contains(keyword) ||
                    b.Ten.ToLower().Contains(keyword) ||
                    b.SoCCCD.Contains(keyword) ||
                    b.DienThoai.Contains(keyword) ||
                    b.BenhNhanCoSo.Any(bn => bn.MaBenhNhanNoiBo.ToLower().Contains(keyword))
                );
            }
            if (!request.IncludeDeleted)
            {
                query = query.Where(b => !b.IsDeleted);
            }
            var totalCount = await _benhNhanRepo.CountAsync(query);

            var rawItems = await query
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedAt)
                .Skip((request.PageIndex - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(b => new
                {
                    b.Id,
                    b.Ho,
                    b.Ten,
                    b.NgaySinh,
                    GioiTinh = (ClinicManagement.Domain.Common.Enums.GioiTinh?)b.GioiTinh,
                    b.DienThoai,
                    b.Email,
                    b.SoCCCD,
                    b.DiaChi,
                    b.NguoiLienHeTen,
                    b.NguoiLienHeDienThoai,
                    b.CreatedAt,
                    b.IsDeleted,
                    MaCoSo = b.BenhNhanCoSo.Select(bn => (int?)bn.MaCoSo).FirstOrDefault(),
                    MaBenhNhanNoiBo = b.BenhNhanCoSo.Select(bn => bn.MaBenhNhanNoiBo).FirstOrDefault(),
                    TenCoSo = b.BenhNhanCoSo.Select(bn => bn.CoSo.Ten).FirstOrDefault(),
                    TrangThaiLuotKham = b.LuotKhams
                        .OrderByDescending(lk => lk.NgayKham)
                        .ThenByDescending(lk => lk.CreatedAt)
                        .Select(lk => (ClinicManagement.Domain.Common.Enums.TrangThaiLuotKham?)lk.TrangThai)
                        .FirstOrDefault(),
                    TenKhoa = b.LuotKhams
                        .OrderByDescending(lk => lk.NgayKham)
                        .ThenByDescending(lk => lk.CreatedAt)
                        .Select(lk => lk.Khoa.Ten)
                        .FirstOrDefault()
                })
                .ToListAsync(cancellationToken);

            var items = rawItems.Select(x => new BenhNhanDto
            {
                Id = x.Id,
                Ho = x.Ho ?? string.Empty,
                Ten = x.Ten ?? string.Empty,
                NgaySinh = x.NgaySinh,
                GioiTinh = x.GioiTinh?.ToString() ?? "M",
                DienThoai = x.DienThoai ?? string.Empty,
                Email = x.Email ?? string.Empty,
                SoCCCD = x.SoCCCD ?? string.Empty,
                DiaChi = x.DiaChi ?? string.Empty,
                NguoiLienHeTen = x.NguoiLienHeTen ?? string.Empty,
                NguoiLienHeDienThoai = x.NguoiLienHeDienThoai ?? string.Empty,
                CreatedAt = x.CreatedAt,
                IsDeleted = x.IsDeleted,

                MaCoSo = x.MaCoSo ?? 0,
                MaBenhNhanNoiBo = x.MaBenhNhanNoiBo ?? string.Empty,
                TenCoSo = x.TenCoSo ?? string.Empty,
                TrangThaiLuotKham = x.TrangThaiLuotKham?.ToString() ?? string.Empty,
                TenKhoa = x.TenKhoa ?? string.Empty
            }).ToList();

            return new PagedResult<BenhNhanDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = items
            };
        }
    }
}