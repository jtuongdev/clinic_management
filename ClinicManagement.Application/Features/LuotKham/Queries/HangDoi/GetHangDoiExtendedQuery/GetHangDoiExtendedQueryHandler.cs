using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetHangDoiExtendedQueryHandler
        : IRequestHandler<GetHangDoiExtendedQuery, PagedResult<HangDoiDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public GetHangDoiExtendedQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<PagedResult<HangDoiDto>> Handle(GetHangDoiExtendedQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _luotKhamRepo.GetHangDoiExtendedAsync(
                request.MaBacSi,
                request.PageIndex,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(l =>
            {
                var benhNhan = l.BenhNhan;
                var coSo = benhNhan.BenhNhanCoSo.FirstOrDefault();

                return new HangDoiDto
                {
                    Id = l.Id,
                    SoThuTu = l.SoThuTu,
                    MaBenhNhanNoiBo = coSo?.MaBenhNhanNoiBo ?? string.Empty,
                    HoTen = $"{benhNhan.Ho} {benhNhan.Ten}",
                    GioiTinh = benhNhan.GioiTinh.ToString(),
                    Tuoi = CalculateAge(benhNhan.NgaySinh),
                    MaLuotKham = l.Id.ToString(),
                    TenKhoa = l.Khoa?.Ten ?? string.Empty,
                    ThoiGianCapNhat = l.ThoiGianBatDauKham ?? l.NgayKham,
                    TrangThai = l.TrangThai.ToString()
                };
            }).ToList();

            return new PagedResult<HangDoiDto>
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