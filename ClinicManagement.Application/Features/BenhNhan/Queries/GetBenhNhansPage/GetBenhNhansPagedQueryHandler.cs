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
            var items = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((request.PageIndex - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(b => new BenhNhanDto
                {
                    Id = b.Id,
                    Ho = b.Ho,
                    Ten = b.Ten,
                    NgaySinh = b.NgaySinh,
                    GioiTinh = b.GioiTinh.ToString(),
                    DienThoai = b.DienThoai,
                    Email = b.Email,
                    SoCCCD = b.SoCCCD,
                    DiaChi = b.DiaChi,
                    NguoiLienHeTen = b.NguoiLienHeTen,
                    NguoiLienHeDienThoai = b.NguoiLienHeDienThoai,
                    CreatedAt = b.CreatedAt,
                    IsDeleted = b.IsDeleted,
                    
                   
                    MaCoSo = b.BenhNhanCoSo.FirstOrDefault().MaCoSo,
                    MaBenhNhanNoiBo = b.BenhNhanCoSo.FirstOrDefault().MaBenhNhanNoiBo,
                    TenCoSo = b.BenhNhanCoSo.FirstOrDefault().CoSo.Ten ,
                    TrangThaiLuotKham = b.LuotKhams
                        .OrderByDescending(lk => lk.CreatedAt)
                        .Select(lk => lk.TrangThai.ToString())
                        .FirstOrDefault() ?? string.Empty,
                    TenKhoa = b.LuotKhams
                        .OrderByDescending(lk => lk.CreatedAt)
                        .Select(lk => lk.Khoa.Ten) 
                        .FirstOrDefault() ?? string.Empty
                            })
                .ToListAsync(cancellationToken);

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