namespace ClinicManagement.Application.DTOs.PhongKham
{
    public class PhongKhamDropdownDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int MaKhoa { get; set; }
    }
}