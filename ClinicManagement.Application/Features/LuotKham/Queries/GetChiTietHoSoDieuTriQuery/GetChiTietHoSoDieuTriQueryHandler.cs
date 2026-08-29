using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetChiTietHoSoDieuTriQueryHandler
        : IRequestHandler<GetChiTietHoSoDieuTriQuery, HoSoDieuTriDto?>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public GetChiTietHoSoDieuTriQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<HoSoDieuTriDto?> Handle(
            GetChiTietHoSoDieuTriQuery request,
            CancellationToken cancellationToken)
        {
            var luotKham = await _luotKhamRepo.GetChiTietHoSoDieuTriAsync(
                request.LuotKhamId,
                cancellationToken);

            if (luotKham == null)
                return null;

            var benhNhan = luotKham.BenhNhan;
            var benhNhanCoSo = benhNhan?.BenhNhanCoSo
                .Where(x => x.MaCoSo == luotKham.MaCoSo)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefault();

            var bhyt = benhNhan?.BaoHiems?
                .Where(b => b.NgayBatDau <= luotKham.NgayKham && b.NgayKetThuc >= luotKham.NgayKham)
                .OrderByDescending(b => b.NgayBatDau)
                .FirstOrDefault();

            return new HoSoDieuTriDto
            {
                Id = luotKham.Id,
                MaLuotKham = $"KH-{luotKham.Id:D3}",
                Khoa = luotKham.Khoa?.Ten ?? string.Empty,
                Phong = luotKham.PhongKham?.Ten ?? string.Empty,
                TrangThai = luotKham.TrangThai.ToString(),

                HoTen = benhNhan == null
                    ? string.Empty
                    : $"{benhNhan.Ho} {benhNhan.Ten}".Trim(),

                MaBenhNhanNoiBo = benhNhanCoSo?.MaBenhNhanNoiBo ?? string.Empty,
                NgaySinh = benhNhan?.NgaySinh.ToString("dd/MM/yyyy") ?? string.Empty,
                GioiTinh = benhNhan?.GioiTinh.ToString() ?? string.Empty,
                SoCCCD = benhNhan?.SoCCCD ?? string.Empty,
                Bhyt = bhyt?.SoThe ?? string.Empty,
                DiaChi = benhNhan?.DiaChi ?? string.Empty,
                DienThoai = benhNhan?.DienThoai ?? string.Empty
            };
        }
    }
}
