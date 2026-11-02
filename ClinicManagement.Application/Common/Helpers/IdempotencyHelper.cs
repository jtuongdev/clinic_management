using System.Text.Json;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Common.Helpers;

/// <summary>
/// Application Helper: xử lý idempotency cho các Command Handler.
/// Thay thế ReplayAsync/SaveReplayAsync từ KhoService cũ.
/// Inject vào Handler nào cần bảo vệ khỏi duplicate request.
/// </summary>
public sealed class IdempotencyHelper(IKhoRepository db)
{
    private static readonly JsonSerializerOptions _jsonOptions =
        new(JsonSerializerDefaults.Web);

    /// <summary>
    /// Kiểm tra xem request với key này đã được xử lý trước đó chưa.
    /// Nếu có, trả về response đã lưu; nếu không, trả về null.
    /// </summary>
    public async Task<IdempotencyResult?> TryReplayAsync(string? key, string operation)
    {
        if (string.IsNullOrWhiteSpace(key)) return null;

        var record = await db.IdempotencyRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == key && x.Operation == operation);

        return record is null
            ? null
            : new IdempotencyResult(record.ResponseJson, record.StatusCode);
    }

    /// <summary>
    /// Lưu kết quả của một operation để replay về sau nếu cần.
    /// </summary>
    public async Task SaveAsync(string? key, string operation, object result, int userId)
    {
        if (string.IsNullOrWhiteSpace(key)) return;

        var record = new IdempotencyRecord
        {
            Key = key,
            Operation = operation,
            StatusCode = 200,
            ResponseJson = JsonSerializer.Serialize(
                new { success = true, message = "Thành công", data = result },
                _jsonOptions)
        };
        record.SetCreatedBy(userId);
        db.Add(record);
        await db.SaveChangesAsync();
    }
}

/// <summary>Kết quả idempotency đã được lưu trước đó.</summary>
public sealed record IdempotencyResult(string ResponseJson, int StatusCode);
