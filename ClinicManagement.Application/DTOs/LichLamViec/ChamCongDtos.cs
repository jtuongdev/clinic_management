namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public class ChamCongDto
    {
        public int Id { get; set; }
        public int MaNhanVien { get; set; }
        public int? MaLichLamViec { get; set; }
        public string TenNhanVien { get; set; } = string.Empty;
        public DateTime NgayChamCong { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public double GioLamThucTe { get; set; }
        public int PhutDiMuon { get; set; }
        public int PhutVeSom { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
    }
    public record CheckInRequest(int MaLichLamViec);
    public record CheckOutRequest(int MaLichLamViec);
    public record AttendanceAdjustmentRequest(int MaChamCong, DateTime? CheckIn, DateTime? CheckOut, string LyDo);
    public record ReviewAttendanceAdjustmentRequest(string? GhiChu);
    public record CreateAttendancePeriodRequest(DateTime TuNgay, DateTime DenNgay, string? GhiChu);
    public class AttendanceAdjustmentDto {
        public int Id { get; set; } public int MaChamCong { get; set; } public int MaNhanVien { get; set; }
        public DateTime? CheckInCu { get; set; } public DateTime? CheckOutCu { get; set; }
        public DateTime? CheckInMoi { get; set; } public DateTime? CheckOutMoi { get; set; }
        public string LyDo { get; set; } = ""; public string TrangThai { get; set; } = "";
        public int? NguoiDuyet { get; set; } public DateTime? ThoiGianDuyet { get; set; } public string GhiChuDuyet { get; set; } = "";
    }
    public class AttendancePeriodDto {
        public int Id { get; set; } public DateTime TuNgay { get; set; } public DateTime DenNgay { get; set; }
        public bool DaKhoa { get; set; } public int? NguoiKhoa { get; set; } public DateTime? ThoiGianKhoa { get; set; } public string GhiChu { get; set; } = "";
        public int SoNhanVien { get; set; }
    }
}
