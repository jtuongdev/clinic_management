using System;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory
{
    public class TonKho : BaseEntity
    {
        public int MaKho { get; set; }
        public int MaItem { get; set; }
        public int MaChiTietNhap { get; set; }
        public decimal SoLuongTon { get; set; }
        public DateTime NgayCapNhatCuoi { get; set; }

        public virtual Kho Kho { get; set; } = null!;
        public virtual Item Item { get; set; } = null!;
        public virtual ChiTietNhapKho ChiTietNhapKho { get; set; } = null!;

        public void AddQuantity(decimal quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Số lượng phải lớn hơn 0");
            
            SoLuongTon += quantity;
            NgayCapNhatCuoi = DateTime.UtcNow;
        }

        public void SubtractQuantity(decimal quantity)
        {
            if (quantity <= 0)
                throw new ArgumentException("Số lượng phải lớn hơn 0");
            
            if (quantity > SoLuongTon)
                throw new InvalidOperationException("Số lượng xuất vượt quá tồn kho");

            SoLuongTon -= quantity;
            NgayCapNhatCuoi = DateTime.UtcNow;
        }

        public bool IsOutOfStock() => SoLuongTon <= 0;
    }
}
