namespace ClinicManagement.Application.DTOs.PhongKham
{
    public class PhongKhamDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
    }
}