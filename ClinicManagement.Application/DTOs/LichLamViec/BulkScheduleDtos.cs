namespace ClinicManagement.Application.DTOs.LichLamViec
{
    public record BulkScheduleRequest(List<int> MaNhanVien, int MaCaTruc, DateTime TuNgay, DateTime DenNgay, List<DayOfWeek>? ThuTrongTuan, string? GhiChu);
    public class BulkScheduleResult { public int CreatedCount { get; set; } public List<DateTime> SkippedDates { get; set; } = []; }
}
