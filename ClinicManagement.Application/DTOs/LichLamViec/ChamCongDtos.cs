namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public class ChamCongDto
    {
        public int Id { get; set; }
        public int MaNhanVien { get; set; }
        public int? MaLichLamViec { get; set; }
        public string TenNhanVien { get; set; } = string.Empty;
        public string TenCa { get; set; } = string.Empty;
        public TimeSpan? ThoiGianBatDau { get; set; }
        public TimeSpan? ThoiGianKetThuc { get; set; }
        public DateTime NgayChamCong { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public double GioLamThucTe { get; set; }
        public int PhutDiMuon { get; set; }
        public int PhutVeSom { get; set; }
        public int? MaKhoa { get; set; }
        public string? TenKhoa { get; set; }
        public string? ChucDanh { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
    }
    public record CheckInRequest(int MaNhanVien, DateTime? ThoiGianQuet = null, string? GhiChu = null, int? MaLichLamViec = null);
    public record CheckOutRequest(int MaNhanVien, DateTime? ThoiGianQuet = null, string? GhiChu = null);
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
    public class DoctorShiftItemDto
    {
        public int Id { get; set; }
        public int MaCaTruc { get; set; }
        public string TenCa { get; set; } = string.Empty;
        public TimeSpan ThoiGianBatDau { get; set; }
        public TimeSpan ThoiGianKetThuc { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public string TenPhongKham { get; set; } = string.Empty;
        public string NguonLich { get; set; } = string.Empty;
        public string TrangThaiLich { get; set; } = string.Empty;
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string TrangThaiChamCong { get; set; } = string.Empty;
        public bool IsCurrentActive { get; set; }
        public bool CanCheckIn { get; set; }
        public bool CanCheckOut { get; set; }
        public bool IsExpired { get; set; }
    }
    public class DoctorTodayStatusDto
    {
        public DateTime Date { get; set; }
        public bool HasSchedule { get; set; }
        public LichLamViecDto? Schedule { get; set; }
        public ChamCongDto? Attendance { get; set; }
        public bool CanCheckIn { get; set; }
        public bool CanCheckOut { get; set; }
        public List<DoctorShiftItemDto> Shifts { get; set; } = new();
    }
}
