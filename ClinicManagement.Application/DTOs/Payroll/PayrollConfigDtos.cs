using ClinicManagement.Domain.Common.Enums;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.Payroll;

public class ChucVuRateDto
{
    public int Id { get; set; }
    public string TenChucVu { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public decimal ThuLaoMoiLuot { get; set; }
}

public class UpdateChucVuRateRequest
{
    public decimal ThuLaoMoiLuot { get; set; }
}

public class HoaHongLoaiDichVuDto
{
    public int Id { get; set; }
    public LoaiDichVu LoaiDichVu { get; set; }
    public string MaLoaiDichVu => LoaiDichVu.ToString();
    public string TenLoaiDichVu { get; set; } = string.Empty;
    public decimal TyLeHoaHong { get; set; }
    public string? GhiChu { get; set; }
}

public class UpdateHoaHongLoaiDichVuRequest
{
    public LoaiDichVu LoaiDichVu { get; set; }
    public decimal TyLeHoaHong { get; set; }
    public string? GhiChu { get; set; }
}

public class BatchUpdateHoaHongLoaiDichVuRequest
{
    public List<UpdateHoaHongLoaiDichVuRequest> Items { get; set; } = [];
}

public class UpdateEmployeeRateRequest
{
    public decimal? ThuLaoMoiLuot { get; set; }
}

public class UpdateServiceRateRequest
{
    public decimal? TyLeHoaHong { get; set; }
}
