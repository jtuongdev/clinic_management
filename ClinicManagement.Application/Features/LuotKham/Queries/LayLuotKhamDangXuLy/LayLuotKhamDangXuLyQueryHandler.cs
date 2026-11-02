using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayLuotKhamDangXuLyQueryHandler
        : IRequestHandler<LayLuotKhamDangXuLyQuery, List<LuotKhamDangXuLyDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayLuotKhamDangXuLyQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<List<LuotKhamDangXuLyDto>> Handle(
            LayLuotKhamDangXuLyQuery request,
            CancellationToken cancellationToken)
        {
            var query = _luotKhamRepo.GetQueryable()
                .Include(l => l.BenhNhan)
                .Include(l => l.BacSi)
                .Include(l => l.Khoa)
                .Include(l => l.CoSo)
                .Include(l => l.PhongKham)
                .Where(l => !l.IsDeleted)
                .Where(l => l.TrangThai == TrangThaiLuotKham.CHO_KHAM || l.TrangThai == TrangThaiLuotKham.DANG_KHAM);

            if (request.MaKhoa.HasValue)
                query = query.Where(l => l.MaKhoa == request.MaKhoa.Value);

            if (request.MaCoSo.HasValue)
                query = query.Where(l => l.MaCoSo == request.MaCoSo.Value);

            var items = await query
                .OrderBy(l => l.NgayKham)
                .ThenBy(l => l.SoThuTu)
                .ToListAsync(cancellationToken);

            return items.Select(l => new LuotKhamDangXuLyDto
            {
                Id = l.Id,
                MaLuotKham = l.Id.ToString(),
                TenBenhNhan = l.BenhNhan != null ? $"{l.BenhNhan.Ho} {l.BenhNhan.Ten}" : "Không xác định",
                Khoa = l.Khoa?.Ten ?? "Không xác định",
                BacSi = l.BacSi?.HoTen ?? "Chưa phân công",
                Phong = l.PhongKham?.Ten ?? "Chưa có",
                ThoiGianBatDauKham = l.ThoiGianBatDauKham,
                TrangThai = l.TrangThai.ToString(),
                SoThuTu = l.SoThuTu ?? 0
            }).ToList();
        }
    }
}