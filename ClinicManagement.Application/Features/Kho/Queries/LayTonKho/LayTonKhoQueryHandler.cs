using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayTonKhoQueryHandler(
    IKhoRepository db,
    IInventorySettings settings)
    : IRequestHandler<LayTonKhoQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayTonKhoQuery request, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 1000);
        var keyword = request.Keyword?.Trim();
        var targetWarehouseId = request.KhoId ?? settings.DefaultWarehouseId;
        var today = DateTime.UtcNow;

        var query = db.Items.AsNoTracking().Where(i => i.IsActive || i.TonKhos.Any(s => s.MaKho == targetWarehouseId && s.SoLuongTon > 0));
        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(i => i.Ma.Contains(keyword) || i.Ten.Contains(keyword));

        var rows = await query.Select(i => new
        {
            itemId = i.Id, itemCode = i.Ma, itemName = i.Ten, itemType = i.LoaiItem.ToString(), baseUnit = i.DonViTinhCoBan, minimumStock = i.TonToiThieu,
            batches = i.TonKhos.Where(s => s.MaKho == targetWarehouseId && s.SoLuongTon > 0).OrderBy(s => s.ChiTietNhapKho.HanSuDung)
                .Select(s => new { stockId = s.Id, batchNumber = s.ChiTietNhapKho.SoLo, expiryDate = s.ChiTietNhapKho.HanSuDung, quantity = s.SoLuongTon })
        }).ToListAsync(ct);

        var allItems = rows.Select(x =>
        {
            var batchList = x.batches.Select(b => new { b.stockId, b.batchNumber, b.expiryDate, b.quantity, daysToExpiry = b.expiryDate.HasValue ? (int?)(b.expiryDate.Value.Date - today.Date).TotalDays : null }).ToList();
            var totalStock = batchList.Sum(b => b.quantity);
            return new { x.itemId, x.itemCode, x.itemName, x.itemType, x.baseUnit, x.minimumStock, totalStock, batches = batchList, isLowStock = totalStock > 0 && totalStock <= x.minimumStock, isOutOfStock = totalStock <= 0 };
        }).ToList();

        var totalCatalog = allItems.Count;
        var inStockCount = allItems.Count(x => x.totalStock > 0);
        var lowStockCount = allItems.Count(x => x.isLowStock);
        var outOfStockCount = allItems.Count(x => x.isOutOfStock);

        var filteredItems = allItems.AsEnumerable();
        if (request.LowStockOnly || string.Equals(request.StockStatus, "LOW_STOCK", StringComparison.OrdinalIgnoreCase)) filteredItems = filteredItems.Where(x => x.isLowStock);
        else if (string.Equals(request.StockStatus, "IN_STOCK", StringComparison.OrdinalIgnoreCase)) filteredItems = filteredItems.Where(x => x.totalStock > 0);
        else if (string.Equals(request.StockStatus, "OUT_OF_STOCK", StringComparison.OrdinalIgnoreCase)) filteredItems = filteredItems.Where(x => x.isOutOfStock);

        var sortedItems = filteredItems.OrderByDescending(x => x.totalStock > 0).ThenByDescending(x => x.totalStock).ThenBy(x => x.itemCode).ToList();
        var total = sortedItems.Count;
        var pagedItems = sortedItems.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToList();

        return InventoryResult.Ok(new { items = pagedItems, total, totalCatalog, inStockCount, lowStockCount, outOfStockCount, pageIndex, pageSize });
    }
}
