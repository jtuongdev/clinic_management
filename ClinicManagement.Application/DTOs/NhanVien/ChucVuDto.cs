namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class ChucVuDto
    {
        public int Id { get; set; }
        public string TenChucVu { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public decimal ThuLaoMoiLuot { get; set; }
    }
}
