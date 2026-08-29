using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory
{
    public class ChiTietXuatKho : BaseEntity
    {
        public int MaPhieuXuat { get; set; }
        public int MaChiTietNhap { get; set; }
        public decimal SoLuongXuat { get; set; }
        public decimal DonGiaXuat { get; set; }
        public int? CreatedBy { get; set; }

        public virtual PhieuXuatKho PhieuXuatKho { get; set; } = null!;
        public virtual ChiTietNhapKho ChiTietNhapKho { get; set; } = null!;
    }
}
