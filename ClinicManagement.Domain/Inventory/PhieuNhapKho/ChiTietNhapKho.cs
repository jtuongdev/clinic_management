using System;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory
{
    public class ChiTietNhapKho : BaseEntity
    {
        public int MaPhieuNhap { get; set; }
        public int MaItem { get; set; }
        public int? MaQuyDoi { get; set; }
        public int? MaChiTietDonDatHang { get; set; }
        public decimal SoLuong { get; set; }
        public decimal DonGiaNhap { get; set; }
        public string SoLo { get; set; } = string.Empty;
        public DateTime? HanSuDung { get; set; }
        public string ViTri { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }

        public virtual PhieuNhapKho PhieuNhapKho { get; set; } = null!;
        public virtual Item Item { get; set; } = null!;
        public virtual DonViTinhQuyDoi? DonViTinhQuyDoi { get; set; }
        public virtual ChiTietDonDatHang? ChiTietDonDatHang { get; set; }
        public virtual TonKho? TonKho { get; set; }
    }
}
