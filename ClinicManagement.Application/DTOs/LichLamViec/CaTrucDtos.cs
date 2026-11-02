namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public class CaTrucDto
    {
        public int Id { get; set; }
        public int MaLoaiCa { get; set; }
        public string TenCa { get; set; } = string.Empty;
        public TimeSpan ThoiGianBatDau { get; set; }
        public TimeSpan ThoiGianKetThuc { get; set; }
        public double SoGioLam { get; set; }
        public decimal HeSo { get; set; }
        public string MoTa { get; set; } = string.Empty;
    }
    public record CreateCaTrucRequest(int MaLoaiCa, string TenCa, TimeSpan ThoiGianBatDau, TimeSpan ThoiGianKetThuc, decimal HeSo, string? MoTa);
    public record UpdateCaTrucRequest(string TenCa, TimeSpan ThoiGianBatDau, TimeSpan ThoiGianKetThuc, decimal HeSo, string? MoTa);
    public class LoaiCaDto { public int Id { get; set; } public string Ma { get; set; } = string.Empty; public string TenLoai { get; set; } = string.Empty; public string MoTa { get; set; } = string.Empty; }
}
