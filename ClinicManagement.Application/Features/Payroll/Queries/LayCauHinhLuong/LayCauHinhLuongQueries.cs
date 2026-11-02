using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record LayDanhSachDinhMucChucVuQuery : IRequest<IReadOnlyList<ChucVuRateDto>>;

public sealed class LayDanhSachDinhMucChucVuHandler(IPayrollRepository repository)
    : IRequestHandler<LayDanhSachDinhMucChucVuQuery, IReadOnlyList<ChucVuRateDto>>
{
    public async Task<IReadOnlyList<ChucVuRateDto>> Handle(
        LayDanhSachDinhMucChucVuQuery request,
        CancellationToken cancellationToken)
    {
        var chucVus = await repository.GetChucVusAsync(cancellationToken);
        return chucVus.Select(c => new ChucVuRateDto
        {
            Id = c.Id,
            TenChucVu = c.TenChucVu,
            MoTa = c.MoTa,
            ThuLaoMoiLuot = c.ThuLaoMoiLuot
        }).ToList();
    }
}

public sealed record LayDanhSachHoaHongLoaiDichVuQuery : IRequest<IReadOnlyList<HoaHongLoaiDichVuDto>>;

public sealed class LayDanhSachHoaHongLoaiDichVuHandler(IPayrollRepository repository)
    : IRequestHandler<LayDanhSachHoaHongLoaiDichVuQuery, IReadOnlyList<HoaHongLoaiDichVuDto>>
{
    private static readonly Dictionary<LoaiDichVu, string> TenLoaiDichVuMap = new()
    {
        { LoaiDichVu.Kham, "Khám bệnh" },
        { LoaiDichVu.XetNghiem, "Xét nghiệm" },
        { LoaiDichVu.ChanDoanHinhAnh, "Chẩn đoán hình ảnh" },
        { LoaiDichVu.DichVuKyThuat, "Dịch vụ kỹ thuật / Thủ thuật" }
    };

    public async Task<IReadOnlyList<HoaHongLoaiDichVuDto>> Handle(
        LayDanhSachHoaHongLoaiDichVuQuery request,
        CancellationToken cancellationToken)
    {
        var existingConfigs = (await repository.GetCauHinhHoaHongLoaiDichVusAsync(cancellationToken))
            .ToDictionary(x => x.LoaiDichVu);

        var result = new List<HoaHongLoaiDichVuDto>();
        foreach (LoaiDichVu loai in System.Enum.GetValues<LoaiDichVu>())
        {
            if (existingConfigs.TryGetValue(loai, out var cfg))
            {
                result.Add(new HoaHongLoaiDichVuDto
                {
                    Id = cfg.Id,
                    LoaiDichVu = cfg.LoaiDichVu,
                    TenLoaiDichVu = TenLoaiDichVuMap.GetValueOrDefault(cfg.LoaiDichVu, cfg.LoaiDichVu.ToString()),
                    TyLeHoaHong = cfg.TyLeHoaHong,
                    GhiChu = cfg.GhiChu
                });
            }
            else
            {
                result.Add(new HoaHongLoaiDichVuDto
                {
                    Id = 0,
                    LoaiDichVu = loai,
                    TenLoaiDichVu = TenLoaiDichVuMap.GetValueOrDefault(loai, loai.ToString()),
                    TyLeHoaHong = 0m,
                    GhiChu = null
                });
            }
        }

        return result;
    }
}
