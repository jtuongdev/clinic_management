using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Payroll;

public class CauHinhHoaHongLoaiDichVu : BaseEntity
{
    public LoaiDichVu LoaiDichVu { get; set; }
    public decimal TyLeHoaHong { get; set; } = 0m;
    public string? GhiChu { get; set; }

    public CauHinhHoaHongLoaiDichVu() { }

    public CauHinhHoaHongLoaiDichVu(LoaiDichVu loaiDichVu, decimal tyLeHoaHong, string? ghiChu = null)
    {
        LoaiDichVu = loaiDichVu;
        TyLeHoaHong = tyLeHoaHong;
        GhiChu = ghiChu;
    }
}
