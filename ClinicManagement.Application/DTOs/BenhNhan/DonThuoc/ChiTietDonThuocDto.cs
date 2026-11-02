// Application/DTOs/BenhNhan/ChiTietDonThuocDto.cs
namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class ChiTietDonThuocDto
    {
        public string TenThuoc { get; set; } = string.Empty;
        public string DonViTinh { get; set; } = string.Empty;
        public decimal SoLuongKe { get; set; }
        public decimal SoLuongDaXuat { get; set; }
        public string LieuDung { get; set; } = string.Empty;
        public string TanSuat { get; set; } = string.Empty;
        public int? SoNgay { get; set; }
        public string HuongDan { get; set; } = string.Empty;
        public decimal DonGia { get; set; }
        public decimal ThanhTien => SoLuongKe * DonGia;
    }
}