namespace ClinicManagement.Application.Features.LichLamViec;

public static class DongHoChamCong
{
    public static TimeZoneInfo GetTimeZone()
    {
        var timeZoneId = OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh";
        return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
    }

    public static DateTime Now()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, GetTimeZone());
    }

    public static DateTime Normalize(DateTime? time)
    {
        if (!time.HasValue || time.Value == default)
            return Now();

        var val = time.Value;
        if (val.Kind == DateTimeKind.Utc)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(val, GetTimeZone());
        }
        return val;
    }

    public static DateTime? NormalizeNullable(DateTime? time)
    {
        if (!time.HasValue || time.Value == default)
            return null;

        var val = time.Value;
        if (val.Kind == DateTimeKind.Utc)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(val, GetTimeZone());
        }
        return val;
    }
}
