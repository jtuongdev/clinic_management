using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Inventory;

public class InventoryTransaction : BaseEntity
{
    public LoaiGiaoDichKho LoaiGiaoDich { get; set; }
    public int MaItem { get; set; }
    public int? MaTonKho { get; set; }
    public string SoLo { get; set; } = string.Empty;
    public decimal SoLuongTruoc { get; set; }
    public decimal SoLuongThayDoi { get; set; }
    public decimal SoLuongSau { get; set; }
    public string MaChungTu { get; set; } = string.Empty;
    public int? MaNguoiThucHien { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
    public string GhiChu { get; set; } = string.Empty;

    public virtual Item Item { get; set; } = null!;
    public virtual TonKho? TonKho { get; set; }
}
