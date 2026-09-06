namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public record BulkScheduleRequest(List<int> MaNhanVien, int MaKhoa, int MaCaTruc, DateTime TuNgay, DateTime DenNgay, List<DayOfWeek>? ThuTrongTuan, string? GhiChu);
    public class BulkScheduleResult { public int CreatedCount { get; set; } public List<DateTime> SkippedDates { get; set; } = []; }
    public record BulkFixedScheduleRequest(List<CreateLichLamViecCoDinhRequest> Items);
    public class BulkFixedScheduleResult
    {
        public int CreatedCount { get; set; }
        public int DuplicateCount { get; set; }
        public int UnassignedEmployeeCount { get; set; }
        public int SkippedCount { get; set; }
    }

    public class GenerateSchedulePreview
    {
        public int ExpectedCount { get; set; }
        public int ExistingCount { get; set; }
        public int ConflictCount { get; set; }
        public int UnassignedEmployeeCount { get; set; }
        public int OutsideEffectiveRangeCount { get; set; }
    }
}
