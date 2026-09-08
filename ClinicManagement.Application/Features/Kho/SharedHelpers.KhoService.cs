using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;


namespace ClinicManagement.Application.Features.Kho;

// Cung cấp helper dùng chung cho quy đổi đơn vị, idempotency và response.
public sealed partial class KhoService
{
    private async Task AddOrUpdateCount(Stocktake stocktake, StocktakeCountRequest request)
    {
        var stock = await db.TonKhos.FirstOrDefaultAsync(x => x.Id == request.StockId);
        if (stock is null) throw new InvalidOperationException("Lô tồn kiểm kê không tồn tại.");
        var count = stocktake.Counts.FirstOrDefault(x => x.MaTonKho == request.StockId);
        if (count is null) stocktake.Counts.Add(new StocktakeCount { MaTonKho = stock.Id,
            SystemQuantity = stock.SoLuongTon, ActualQuantity = request.ActualQuantity, Reason = request.Reason ?? string.Empty });
        else { count.ActualQuantity = request.ActualQuantity; count.Reason = request.Reason ?? string.Empty; }
    }

    public async Task<InventoryResult> Audit(int? itemId, DateTime? fromDate,
        DateTime? toDate, int pageIndex = 1, int pageSize = 50)
    {
        var query = db.InventoryTransactions.AsNoTracking().Where(x => !itemId.HasValue || x.MaItem == itemId.Value);
        if (fromDate.HasValue) query = query.Where(x => x.CreatedAt >= fromDate.Value);
        if (toDate.HasValue) query = query.Where(x => x.CreatedAt <= toDate.Value);
        var total = await query.CountAsync();
        var data = await query.OrderByDescending(x => x.CreatedAt).Skip((Math.Max(1, pageIndex) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100)).Select(x => new { id = x.Id, createdAt = x.CreatedAt,
                transactionType = x.LoaiGiaoDich.ToString(), referenceCode = x.MaChungTu, itemId = x.MaItem,
                batchNumber = x.SoLo, quantityBefore = x.SoLuongTruoc, quantityChange = x.SoLuongThayDoi,
                quantityAfter = x.SoLuongSau, performer = x.MaNguoiThucHien }).ToListAsync();
        return InventoryResult.Ok(new { data, total });
    }
    private async Task<decimal> ToBaseQuantity(Item item, decimal quantity, string? unit)
    {
        if (quantity <= 0) return 0;
        if (string.IsNullOrWhiteSpace(unit) || unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)) return quantity;
        var conversion = await db.DonViTinhQuyDois.FirstOrDefaultAsync(x => x.MaItem == item.Id && x.DonVi == unit);
        return conversion is null ? 0 : quantity * conversion.HeSo;
    }

    private async Task<InventoryResult?> ReplayAsync(string key, string operation)
    {
        if (string.IsNullOrWhiteSpace(key)) return null;
        var record = await db.IdempotencyRecords.AsNoTracking().FirstOrDefaultAsync(x => x.Key == key && x.Operation == operation);
        return record is null ? null : InventoryResult.Raw(record.ResponseJson, record.StatusCode);
    }

    private async Task SaveReplayAsync(string key, string operation, object result)
    {
        if (string.IsNullOrWhiteSpace(key)) return;
        var record = new IdempotencyRecord
        {
            Key = key,
            Operation = operation,
            StatusCode = 200,
            ResponseJson = JsonSerializer.Serialize(
                new { success = true, message = "Thành công", data = result },
                new JsonSerializerOptions(JsonSerializerDefaults.Web))
        };
        record.SetCreatedBy(UserId);
        db.Add(record);
        await db.SaveChangesAsync();
    }
}
