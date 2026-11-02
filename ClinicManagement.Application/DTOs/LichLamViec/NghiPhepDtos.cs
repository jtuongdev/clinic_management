namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public class NghiPhepDto
    {
        public int Id { get; set; }
        public int MaNhanVien { get; set; }
        public string TenNhanVien { get; set; } = string.Empty;
        public DateTime TuNgay { get; set; }
        public DateTime DenNgay { get; set; }
        public string LoaiNghi { get; set; } = string.Empty;
        public string LyDo { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime? NgayDuyet { get; set; }
    }
    public record CreateNghiPhepRequest(int MaNhanVien, DateTime TuNgay, DateTime DenNgay, string LoaiNghi, string LyDo);
    public record ReviewNghiPhepRequest(string? GhiChu);
}
