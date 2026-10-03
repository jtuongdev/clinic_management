namespace ClinicManagement.Application.Common.Interfaces;

/// <summary>
/// Kiểu kết quả chung cho tất cả Kho Command/Query Handlers.
/// </summary>
public sealed record InventoryResult(object? Data, string? Message = null, int StatusCode = 200, string? RawJson = null)
{
    public bool IsSuccess => Message is null;
    public static InventoryResult Ok(object? data) => new(data);
    public static InventoryResult Error(string message, int statusCode = 400) => new(null, message, statusCode);
    /// <summary>Khôi phục response đã lưu từ IdempotencyRecord.</summary>
    public static InventoryResult Raw(string json, int statusCode) => new(null, null, statusCode, json);
}

/// <summary>
/// Cấu hình inventory được inject qua IConfiguration.
/// Đăng ký trong Infrastructure/DependencyInjection.cs.
/// </summary>
public interface IInventorySettings
{
    int DefaultWarehouseId { get; }
    bool RequirePaymentBeforeDispense { get; }
}
