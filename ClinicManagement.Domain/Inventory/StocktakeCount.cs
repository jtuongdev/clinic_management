using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory;

public class StocktakeCount : BaseEntity
{
    public int StocktakeId { get; set; }
    public int MaTonKho { get; set; }
    public decimal SystemQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public virtual Stocktake Stocktake { get; set; } = null!;
    public virtual TonKho TonKho { get; set; } = null!;
}
