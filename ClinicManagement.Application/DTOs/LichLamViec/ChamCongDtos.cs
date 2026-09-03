namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public class ChamCongDto
    {
        public int Id { get; set; }
        public int MaNhanVien { get; set; }
        public string TenNhanVien { get; set; } = string.Empty;
        public DateTime NgayChamCong { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
    }
    public record CheckInRequest(int MaNhanVien);
    public record CheckOutRequest(int MaNhanVien);
}
