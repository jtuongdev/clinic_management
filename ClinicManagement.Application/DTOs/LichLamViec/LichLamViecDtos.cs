namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public class LichLamViecDto
    {
        public int Id { get; set; }
        public int MaNhanVien { get; set; }
        public string TenNhanVien { get; set; } = string.Empty;
        public int MaCaTruc { get; set; }
        public string TenCa { get; set; } = string.Empty;
        public DateTime NgayLam { get; set; }
        public TimeSpan ThoiGianBatDau { get; set; }
        public TimeSpan ThoiGianKetThuc { get; set; }
        public double SoGioLam { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }

    public class CreateLichLamViecRequest
    {
        public int MaNhanVien { get; set; }
        public int MaCaTruc { get; set; }
        public DateTime NgayLam { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }

    public class UpdateLichLamViecRequest
    {
        public int MaCaTruc { get; set; }
        public DateTime NgayLam { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }
}
