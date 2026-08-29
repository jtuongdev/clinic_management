// Application/DTOs/BenhNhan/ChiTietHoaDonDto.cs
namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class ChiTietHoaDonDto
    {
        public int Id { get; set; }
        public string LoaiDoiTuong { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public decimal SoLuong { get; set; }
        public decimal DonGia { get; set; }
        public decimal ThanhTien { get; set; }
    }
}