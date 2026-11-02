namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class BenhNhanListDto
    {
        public int Id { get; set; }

        public string MaBenhNhanNoiBo { get; set; } = string.Empty;

        public string HoTen { get; set; } = string.Empty;

        public string GioiTinh { get; set; } = string.Empty;

        public int Tuoi { get; set; }

        public string? DienThoai { get; set; }

        public string MaLuotKhamGanNhat { get; set; } = string.Empty;

        public string Khoa { get; set; } = string.Empty;

        public string BacSi { get; set; } = string.Empty;

        public string TrangThaiLuotKham { get; set; } = string.Empty;

        public DateTime? ThoiGianBatDauKham { get; set; }

        public int? SoThuTu { get; set; }
    }
}