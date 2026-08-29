using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Domain.Prescription
{
    public class ChiTietDonThuoc : BaseEntity
    {
        public int MaDonThuoc { get; set; }
        public int MaItem { get; set; }
        public decimal SoLuongKe { get; set; }
        public decimal SoLuongDaXuat { get; set; }
        public string LieuDung { get; set; } = string.Empty;
        public string TanSuat { get; set; } = string.Empty;
        public int? SoNgay { get; set; }
        public string HuongDan { get; set; } = string.Empty;
        public decimal DonGiaKe { get; set; }
        public int? CreatedBy { get; set; }

        public virtual DonThuoc DonThuoc { get; set; } = null!;
        public virtual Item Item { get; set; } = null!;

        public void UpdateDispensedQuantity(decimal quantity)
        {
            SoLuongDaXuat += quantity;
            if (SoLuongDaXuat > SoLuongKe)
                throw new InvalidOperationException("Số lượng xuất vượt quá số lượng kê đơn");
        }

        public decimal RemainingQuantity() => SoLuongKe - SoLuongDaXuat;
        public bool IsFullyDispensed() => SoLuongDaXuat >= SoLuongKe;
    }
}
