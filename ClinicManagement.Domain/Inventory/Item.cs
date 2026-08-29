using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Inventory
{
    public class Item : BaseEntity
    {
        public LoaiItem LoaiItem { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string TenGoc { get; set; } = string.Empty;
        public string DangBaoChe { get; set; } = string.Empty;
        public string HamLuong { get; set; } = string.Empty;
        public string DonViTinhCoBan { get; set; } = string.Empty;
        public decimal GiaBanLe { get; set; }
        public bool CanKeDon { get; set; }
        public bool IsActive { get; set; }

        public virtual ICollection<DonViTinhQuyDoi> DonViTinhQuyDois { get; set; }
        public virtual ICollection<TonKho> TonKhos { get; set; }
        public virtual ICollection<ChiTietNhapKho> ChiTietNhapKhos { get; set; }
        public virtual ICollection<Prescription.ChiTietDonThuoc> ChiTietDonThuocs { get; set; }

        public Item()
        {
            DonViTinhQuyDois = new List<DonViTinhQuyDoi>();
            TonKhos = new List<TonKho>();
            ChiTietNhapKhos = new List<ChiTietNhapKho>();
            ChiTietDonThuocs = new List<Prescription.ChiTietDonThuoc>();
        }
    }
}
