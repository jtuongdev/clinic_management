namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public class LichLamViecDto
    {
        public int Id { get; set; }
        public int MaNhanVien { get; set; }
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public string TenNhanVien { get; set; } = string.Empty;
        public int MaCaTruc { get; set; }
        public int? MaPhongKham { get; set; }
        public string TenPhongKham { get; set; } = string.Empty;
        public int? MaLichLamViecCoDinh { get; set; }
        public string NguonLich { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "LAM_VIEC";
        // Indicates that this is a daily schedule status, not the leave request itself.
        public bool LaNghiTheoNgay { get; set; }
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
        public int MaKhoa { get; set; }
        public int MaCaTruc { get; set; }
        public int? MaPhongKham { get; set; }
        public string TrangThai { get; set; } = "LAM_VIEC";
        public DateTime NgayLam { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }

    public class UpdateLichLamViecRequest
    {
        public int MaCaTruc { get; set; }
        public int? MaPhongKham { get; set; }
        public string TrangThai { get; set; } = "LAM_VIEC";
        public DateTime NgayLam { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }

    public class LichLamViecCoDinhDto
    {
        public int Id { get; set; }
        public int MaNhanVien { get; set; }
        public string TenNhanVien { get; set; } = string.Empty;
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public int MaCaTruc { get; set; }
        public string TenCa { get; set; } = string.Empty;
        public int? MaPhongKham { get; set; }
        public string TenPhongKham { get; set; } = string.Empty;
        public DayOfWeek ThuTrongTuan { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }

    public sealed record FixedShiftItemDto(
        DayOfWeek ThuTrongTuan,
        int MaCaTruc,
        int? MaPhongKham
    );

    public sealed record SetFixedScheduleRequest(
        int MaNhanVien,
        List<FixedShiftItemDto> Shifts
    );

    public sealed record GenerateMonthlyScheduleRequest(
        int Thang,
        int Nam,
        int? MaKhoa = null,
        int? MaNhanVien = null
    );

    public sealed record GenerateMonthlyScheduleResult(
        int Thang,
        int Nam,
        int TotalDays,
        int TotalSchedulesGenerated,
        int TotalSchedulesSkipped,
        int TotalEmployeesScheduled
    );

    public class CreateLichLamViecCoDinhRequest
    {
        public int MaNhanVien { get; set; }
        public int MaKhoa { get; set; }
        public int MaCaTruc { get; set; }
        public int? MaPhongKham { get; set; }
        public DayOfWeek ThuTrongTuan { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }

    public class UpdateLichLamViecCoDinhRequest : CreateLichLamViecCoDinhRequest
    {
    }
}
