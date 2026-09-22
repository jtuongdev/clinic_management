using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory
{
    public class ChiTietDonDatHang : BaseEntity
    {
        public int MaDonDatHang { get; set; }
        public int MaItem { get; set; }
        public int? MaQuyDoi { get; set; }
        public string DonViTinh { get; set; } = string.Empty;
        public decimal SoLuongDat { get; set; }
        public decimal SoLuongDaNhap { get; set; }
        public decimal DonGiaDat { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }

        public virtual DonDatHang DonDatHang { get; set; } = null!;
        public virtual Item Item { get; set; } = null!;
        public virtual DonViTinhQuyDoi? DonViTinhQuyDoi { get; set; }
        public virtual ICollection<ChiTietNhapKho> ChiTietNhapKhos { get; set; }

        public ChiTietDonDatHang()
        {
            ChiTietNhapKhos = new List<ChiTietNhapKho>();
        }

        public decimal SoLuongConLai => Math.Max(0, SoLuongDat - SoLuongDaNhap);
    }
}
