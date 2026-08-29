using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Billing
{
    public class ChiTietHoaDon : BaseEntity
    {
        public int MaHoaDon { get; set; }
        public string LoaiDoiTuong { get; set; } = string.Empty;
        public int MaDoiTuong { get; set; }     
        public string MoTa { get; set; } = string.Empty;
        public decimal SoLuong { get; set; }
        public decimal DonGia { get; set; }
        public decimal ThanhTien => SoLuong * DonGia;
        public int? CreatedBy { get; set; }

        public virtual HoaDon HoaDon { get; set; } = null!;
    }
}
