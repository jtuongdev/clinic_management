using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Domain.Service
{
    public class DinhMucVatTuDichVu : BaseEntity
    {
        public int MaDanhMucDichVu { get; set; }
        public int MaItem { get; set; }
        public decimal SoLuong { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;

        public virtual DanhMucDichVu DanhMucDichVu { get; set; } = null!;
        public virtual Item Item { get; set; } = null!;
    }
}
