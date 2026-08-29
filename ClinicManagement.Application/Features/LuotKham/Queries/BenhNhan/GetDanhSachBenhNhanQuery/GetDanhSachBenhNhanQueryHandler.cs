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
    public class GetDanhSachBenhNhanQueryHandler
        : IRequestHandler<GetDanhSachBenhNhanQuery, PagedResult<BenhNhanListDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public GetDanhSachBenhNhanQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<PagedResult<BenhNhanListDto>> Handle(
            GetDanhSachBenhNhanQuery request,
            CancellationToken cancellationToken)
        {
            // Gọi repository method mới
            var (items, totalCount) = await _benhNhanRepo.GetBenhNhanPagedAsync(
                request.PageIndex,
                request.PageSize,
                request.Keyword,
                request.TrangThai,
                request.MaKhoa,
                request.MaCoSo,
                cancellationToken);

            // Map sang DTO
            var dtos = items.Select(x => new BenhNhanListDto
            {
                Id = x.BenhNhan.Id,
                MaBenhNhanNoiBo = x.BenhNhan.BenhNhanCoSo
                    .FirstOrDefault(bn => request.MaCoSo == null || bn.MaCoSo == request.MaCoSo)
                    ?.MaBenhNhanNoiBo ?? string.Empty,
                HoTen = $"{x.BenhNhan.Ho} {x.BenhNhan.Ten}",
                GioiTinh = x.BenhNhan.GioiTinh.ToString(),
                Tuoi = CalculateAge(x.BenhNhan.NgaySinh),
                DienThoai = x.BenhNhan.DienThoai,
                MaLuotKhamGanNhat = x.LuotKhamGanNhat.Id.ToString(),
                Khoa = x.LuotKhamGanNhat.Khoa?.Ten ?? string.Empty,
                BacSi = x.LuotKhamGanNhat.BacSi?.HoTen ?? string.Empty,
                TrangThaiLuotKham = x.LuotKhamGanNhat.TrangThai.ToString(),
                ThoiGianBatDauKham = x.LuotKhamGanNhat.ThoiGianBatDauKham,
                SoThuTu = x.LuotKhamGanNhat.SoThuTu
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