namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class DanhMucDichVuDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string LoaiDichVu { get; set; } = string.Empty;
        public string DonViTinh { get; set; } = string.Empty;
        public decimal Gia { get; set; }
    }
}
