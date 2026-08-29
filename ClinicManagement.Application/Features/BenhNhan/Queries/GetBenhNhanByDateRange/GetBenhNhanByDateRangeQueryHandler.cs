using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhanByDateRangeQueryHandler : IRequestHandler<GetBenhNhanByDateRangeQuery, IReadOnlyList<BenhNhanDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public GetBenhNhanByDateRangeQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<IReadOnlyList<BenhNhanDto>> Handle(GetBenhNhanByDateRangeQuery request, CancellationToken cancellationToken)
        {
            var benhNhans = await _benhNhanRepo.GetByDateRangeAsync(request.FromDate, request.ToDate);

            var result = benhNhans.Select(b => new BenhNhanDto
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
                
                MaCoSo = b.BenhNhanCoSo.FirstOrDefault()?.MaCoSo ?? 0,
                MaBenhNhanNoiBo = b.BenhNhanCoSo.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                TenCoSo = b.BenhNhanCoSo.FirstOrDefault()?.CoSo?.Ten ?? string.Empty,
                TrangThaiLuotKham = b.LuotKhams
                    .OrderByDescending(lk => lk.CreatedAt)
                    .Select(lk => lk.TrangThai.ToString())
                    .FirstOrDefault() ?? string.Empty
            }).ToList();

            return result;
        }
    }
}