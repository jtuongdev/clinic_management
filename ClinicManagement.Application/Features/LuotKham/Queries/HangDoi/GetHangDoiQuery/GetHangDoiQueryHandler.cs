
using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetHangDoiQueryHandler
        : IRequestHandler<GetHangDoiQuery, PagedResult<BenhNhanListDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public GetHangDoiQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<PagedResult<BenhNhanListDto>> Handle(GetHangDoiQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _luotKhamRepo.GetHangDoiByBacSiAsync(
                request.MaBacSi,
                request.PageIndex,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(l => new BenhNhanListDto
            {
                Id = l.BenhNhan.Id,
                MaBenhNhanNoiBo = l.BenhNhan.BenhNhanCoSo.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                HoTen = $"{l.BenhNhan.Ho} {l.BenhNhan.Ten}",
                GioiTinh = l.BenhNhan.GioiTinh.ToString(),
                Tuoi = CalculateAge(l.BenhNhan.NgaySinh),
                DienThoai = l.BenhNhan.DienThoai,
                MaLuotKhamGanNhat = $"KH-{l.Id:D3}",
                Khoa = l.Khoa?.Ten ?? string.Empty,
                BacSi = l.BacSi?.HoTen ?? string.Empty,
                TrangThaiLuotKham = l.TrangThai.ToString(),
                ThoiGianBatDauKham = l.ThoiGianBatDauKham,
                SoThuTu = l.SoThuTu
            }).ToList();

            return new PagedResult<BenhNhanListDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }

        private static int CalculateAge(DateTime birthDate)
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}