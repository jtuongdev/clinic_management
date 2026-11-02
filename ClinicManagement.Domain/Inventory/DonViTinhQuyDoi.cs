using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory
{
    public class DonViTinhQuyDoi : BaseEntity
    {
        public int MaItem { get; set; }
        public string DonVi { get; set; } = string.Empty;
        public decimal HeSo { get; set; }
        public bool IsBase { get; set; }

        public virtual Item Item { get; set; } = null!;
    }
}
