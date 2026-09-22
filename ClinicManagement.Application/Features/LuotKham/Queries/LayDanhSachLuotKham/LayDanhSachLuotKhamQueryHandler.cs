using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayDanhSachLuotKhamQueryHandler
        : IRequestHandler<LayDanhSachLuotKhamQuery, PagedResult<LuotKhamListDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayDanhSachLuotKhamQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }
        

        public async Task<PagedResult<LuotKhamListDto>> Handle(
            LayDanhSachLuotKhamQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalCount) =
                await _luotKhamRepo.GetPagedAsync(
                    request.PageIndex,
                    request.PageSize,
                    request.MaBenhNhan,
                    request.MaBacSi,
                    request.MaKhoa,
                    request.TrangThai,
                    request.FromDate,
                    request.ToDate,
                    request.SortBy,
                    request.SortDesc,
                    cancellationToken);

            var dtos = items.Select(l =>
            {
                // ============================================
                // LẤY BỆNH NHÂN
                // ============================================

                var benhNhan = l.BenhNhan;

                // ============================================
                // LẤY MÃ BỆNH NHÂN NỘI BỘ
                // THEO ĐÚNG CƠ SỞ CỦA LƯỢT KHÁM
                // ============================================

                var benhNhanCoSo =
                    benhNhan?.BenhNhanCoSo?
                        .FirstOrDefault(x =>
                            x.MaCoSo == l.MaCoSo);

                var maBenhNhanNoiBo =
                    benhNhanCoSo?.MaBenhNhanNoiBo
                    ?? string.Empty;

                // ============================================
                // KIỂM TRA BHYT TẠI THỜI ĐIỂM KHÁM
                // ============================================

                var coBHYT =
                    benhNhan?.BaoHiems?
                        .Any(b =>
                            b.NgayBatDau <= l.NgayKham &&
                            b.NgayKetThuc >= l.NgayKham)
                    ?? false;

                // ============================================
                // DTO
                // ============================================

                return new LuotKhamListDto
                {
                    Id = l.Id,

                    MaBenhNhanNoiBo =
                        maBenhNhanNoiBo,

                    TenBenhNhan =
                        benhNhan != null
                            ? $"{benhNhan.Ho} {benhNhan.Ten}"
                            : string.Empty,

                    Tuoi =
                        benhNhan != null
                            ? CalculateAge(benhNhan.NgaySinh)
                            : 0,

                    GioiTinh =
                        benhNhan?.GioiTinh.ToString()
                        ?? string.Empty,

                    TenPhongKham =
                        l.PhongKham?.Ten
                        ?? string.Empty,

                    HinhThucDieuTri =
                        l.HinhThucDieuTri.ToString(),

                    CoBHYT =
                        coBHYT,

                    TenBacSi =
                        l.BacSi?.HoTen
                        ?? string.Empty,

                    TenKhoa =
                        l.Khoa?.Ten
                        ?? string.Empty,

                    TrangThai =
                        l.TrangThai.ToString(),

                    ThoiGianBatDauKham =
                        l.ThoiGianBatDauKham,

                    SoThuTu =
                        l.SoThuTu
                };
            }).ToList();

            return new PagedResult<LuotKhamListDto>
            {
                PageIndex = request.PageIndex,
                PageSize = request.PageSize,
                TotalCount = totalCount,
                Items = dtos
            };
        }

        private int CalculateAge(DateTime birthDate)
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}