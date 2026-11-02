using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.Payroll;

public sealed class HisSummaryBangLuongQueryHandler(IPayrollRepository payrollRepo, ILuotKhamRepository luotKhamRepo) 
    : IRequestHandler<HisSummaryBangLuongQuery, HisSummaryDto>
{
    public async Task<HisSummaryDto> Handle(HisSummaryBangLuongQuery request, CancellationToken cancellationToken)
    {
        var bangLuong = await payrollRepo.GetBangLuongAsync(request.BangLuongId, true, cancellationToken)
            ?? throw new System.Collections.Generic.KeyNotFoundException("Không tìm thấy bảng lương.");

        var nhanVien = bangLuong.NhanVien;
        var kyLuong = bangLuong.KyLuong;

        // Query Lượt khám và Dịch vụ
        var luotKhams = await luotKhamRepo.GetQueryable()
            .Include(x => x.BenhNhan)
            .Include(x => x.ChiDinhDichVus)
                .ThenInclude(c => c.DanhMucDichVu)
            .Where(x => x.MaBacSi == nhanVien.Id 
                     && x.NgayKham.Date >= kyLuong.TuNgay.Date 
                     && x.NgayKham.Date <= kyLuong.DenNgay.Date)
            .ToListAsync(cancellationToken);

        var defaultRates = (await payrollRepo.GetCauHinhHoaHongLoaiDichVusAsync(cancellationToken))
            .ToDictionary(x => x.LoaiDichVu, x => x.TyLeHoaHong);

        var luotKhamHoanThanh = luotKhams.Where(x => x.TrangThai == TrangThaiLuotKham.HOAN_THANH).ToList();
        var soLuot = luotKhamHoanThanh.Count;
        var thuLao = soLuot * nhanVien.GetEffectiveThuLaoMoiLuot();

        var chiDinhs = luotKhams.SelectMany(x => x.ChiDinhDichVus).ToList();
        var tongHoaHong = chiDinhs.Sum(x => {
            var gia = x.DanhMucDichVu?.Gia ?? 0m;
            var tyLe = x.DanhMucDichVu?.TyLeHoaHong ?? (x.DanhMucDichVu != null ? defaultRates.GetValueOrDefault(x.DanhMucDichVu.LoaiDichVu, 0m) : 0m);
            return gia * (tyLe / 100m);
        });

        return new HisSummaryDto
        {
            SoLuotKhamHoanThanh = soLuot,
            TienThuLaoKham = thuLao,
            SoDichVuClsChiDinh = chiDinhs.Count,
            TongHoaHongCls = tongHoaHong,
            ChiTietLuotKhams = luotKhamHoanThanh.Select(x => new ChiTietLuotKhamDto
            {
                NgayKham = x.NgayKham,
                MaBenhNhan = x.MaBenhNhan,
                TenBenhNhan = x.BenhNhan != null ? $"{x.BenhNhan.Ho} {x.BenhNhan.Ten}".Trim() : "",
                TrangThai = x.TrangThai.ToString()
            }).ToList()
        };
    }
}
