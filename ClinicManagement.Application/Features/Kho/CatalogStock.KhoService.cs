using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace ClinicManagement.Application.Features.Kho;

// Xử lý danh mục thuốc/vật tư, quy đổi đơn vị, truy vấn tồn kho và cảnh báo.
public sealed partial class KhoService
{
    public async Task<InventoryResult> Items(string? keyword, LoaiItem? itemType,
        bool? isActive, int pageIndex = 1, int pageSize = 20)
    {
        pageIndex = Math.Max(1, pageIndex);
        pageSize = Math.Clamp(pageSize, 1, 100);
        
        var query = db.Items.AsNoTracking().Where(x => !isActive.HasValue || x.IsActive == isActive.Value);
        if (itemType.HasValue) query = query.Where(x => x.LoaiItem == itemType.Value);
        if (!string.IsNullOrWhiteSpace(keyword))
            query = query.Where(x => x.Ma.Contains(keyword) || x.Ten.Contains(keyword));
        var total = await query.CountAsync();
        var data = await query.OrderBy(x => x.Ten).Skip((pageIndex - 1) * pageSize).Take(pageSize)
            .Select(x => new { id = x.Id, code = x.Ma, name = x.Ten, itemType = x.LoaiItem,
                baseUnit = x.DonViTinhCoBan, salePrice = x.GiaBanLe, minimumStock = x.TonToiThieu,
                isActive = x.IsActive, conversions = x.DonViTinhQuyDois.Select(c => new { unit = c.DonVi, factor = c.HeSo }) })
            .ToListAsync();
        if (total == 0)
            logger.LogWarning("Inventory không có dữ liệu danh mục. Keyword={Keyword}, ItemType={ItemType}, IsActive={IsActive}",
                keyword, itemType, isActive);
        return InventoryResult.Ok(new { items = data, total });
    }

    public async Task<InventoryResult> CreateItem(ItemRequest request)
    {
        if (request.SalePrice < 0 || request.MinimumStock < 0 || string.IsNullOrWhiteSpace(request.Code) ||
            string.IsNullOrWhiteSpace(request.BaseUnit)) return InventoryResult.Error("Thông tin danh mục không hợp lệ.");
        if (await db.Items.AnyAsync(x => x.Ma == request.Code)) return InventoryResult.Error("Mã hàng đã tồn tại.", 409);
        var item = new Item { Ma = request.Code.Trim(), Ten = request.Name.Trim(), LoaiItem = request.ItemType,
            DonViTinhCoBan = request.BaseUnit.Trim(), DangBaoChe = request.DosageForm ?? string.Empty,
            HamLuong = request.Strength ?? string.Empty, GiaBanLe = request.SalePrice,
            TonToiThieu = request.MinimumStock, CanKeDon = request.CanPrescribe, IsActive = true };
        item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = item.DonViTinhCoBan, HeSo = 1, IsBase = true });
        foreach (var conversion in request.Conversions ?? [])
        {
            if (conversion.Factor <= 0 || string.IsNullOrWhiteSpace(conversion.Unit) ||
                conversion.Unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)) return InventoryResult.Error("Đơn vị quy đổi không hợp lệ.");
            item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = conversion.Unit.Trim(), HeSo = conversion.Factor });
        }
        db.Add(item);
        await db.SaveChangesAsync();
        return InventoryResult.Ok(new { id = item.Id });
    }

    public async Task<InventoryResult> UpdateItem(int id, ItemRequest request)
    {
        var item = await db.Items.Include(x => x.DonViTinhQuyDois).FirstOrDefaultAsync(x => x.Id == id);
        if (item is null) return InventoryResult.Error("Không tìm thấy mặt hàng.", 404);
        var hasTransactions = await db.InventoryTransactions.AnyAsync(x => x.MaItem == id);
        if (hasTransactions)
        {
            // Đã phát sinh giao dịch: chỉ cho sửa thông tin thương mại — không được đổi baseUnit/conversions (dvcs & chuyen doi)
            item.Ten = request.Name.Trim();
            item.DangBaoChe = request.DosageForm ?? string.Empty;
            item.HamLuong = request.Strength ?? string.Empty;
            item.GiaBanLe = request.SalePrice;
            item.TonToiThieu = request.MinimumStock;
            item.CanKeDon = request.CanPrescribe;
        }
        else
        {
            // Chưa có giao dịch: cho sửa tự do kể cả baseUnit và conversions 
            item.Ma = request.Code.Trim(); item.Ten = request.Name.Trim(); item.LoaiItem = request.ItemType;
            item.DonViTinhCoBan = request.BaseUnit.Trim(); item.DangBaoChe = request.DosageForm ?? string.Empty;
            item.HamLuong = request.Strength ?? string.Empty; item.GiaBanLe = request.SalePrice;
            item.TonToiThieu = request.MinimumStock; item.CanKeDon = request.CanPrescribe;
            item.DonViTinhQuyDois.Clear();
            item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = item.DonViTinhCoBan, HeSo = 1, IsBase = true });
            foreach (var conversion in request.Conversions ?? [])
            {
                if (conversion.Factor <= 0 || string.IsNullOrWhiteSpace(conversion.Unit) ||
                    conversion.Unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase)) return InventoryResult.Error("Đơn vị quy đổi không hợp lệ.");
                item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = conversion.Unit.Trim(), HeSo = conversion.Factor });
            }
        }
        await db.SaveChangesAsync();
        return InventoryResult.Ok(new { id, lockedFields = hasTransactions ? new[] { "baseUnit", "conversions", "code" } : [] });
    }


        public async Task<InventoryResult> ToggleItem(int id)
    {
        var item = await db.Items.FirstOrDefaultAsync(x => x.Id == id);
        if (item is null) return InventoryResult.Error("Không tìm thấy mặt hàng.", 404);
        item.IsActive = !item.IsActive;
        await db.SaveChangesAsync();
        return InventoryResult.Ok(new { id, isActive = item.IsActive });
    }

        public async Task<InventoryResult> Stock(string? keyword, bool lowStockOnly = false,
        int pageIndex = 1, int pageSize = 20)
    {
        var today = DateTime.UtcNow;
        var query = db.Items.AsNoTracking().Where(i => i.IsActive);
        if (!string.IsNullOrWhiteSpace(keyword)) query = query.Where(i => i.Ma.Contains(keyword) || i.Ten.Contains(keyword));
        var rows = await query.Select(i => new
        {
            itemId = i.Id, itemCode = i.Ma, itemName = i.Ten, baseUnit = i.DonViTinhCoBan,
            minimumStock = i.TonToiThieu,
            batches = i.TonKhos.Where(s => s.MaKho == DefaultWarehouseId && s.SoLuongTon > 0 &&
                (!s.ChiTietNhapKho.HanSuDung.HasValue || s.ChiTietNhapKho.HanSuDung.Value >= today))
                .OrderBy(s => s.ChiTietNhapKho.HanSuDung)
                .Select(s => new { stockId = s.Id, batchNumber = s.ChiTietNhapKho.SoLo,
                    expiryDate = s.ChiTietNhapKho.HanSuDung, quantity = s.SoLuongTon })
        }).ToListAsync();

        var allItems = rows.Select(x =>
        {
            var batchList = x.batches.Select(b => new
            {
                b.stockId,
                b.batchNumber,
                b.expiryDate,
                b.quantity,
                daysToExpiry = b.expiryDate.HasValue ? (int?)(b.expiryDate.Value.Date - today.Date).TotalDays : null
            }).ToList();

            var totalStock = batchList.Sum(b => b.quantity);
            return new
            {
                x.itemId,
                x.itemCode,
                x.itemName,
                x.baseUnit,
                x.minimumStock,
                totalStock,
                batches = batchList,
                isLowStock = totalStock <= x.minimumStock
            };
        }).Where(x => !lowStockOnly || x.isLowStock).ToList();

        var total = allItems.Count;
        var pagedItems = allItems
            .Skip((Math.Max(1, pageIndex) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToList();

        if (total == 0)
            logger.LogWarning("Inventory không có dữ liệu tồn kho. Keyword={Keyword}, LowStockOnly={LowStockOnly}",
                keyword, lowStockOnly);
        return InventoryResult.Ok(new { items = pagedItems, total });
    }

        public async Task<InventoryResult> Alerts(int expiringWithinDays = 60)
    {
        var now = DateTime.UtcNow;
        var limit = now.AddDays(Math.Max(0, expiringWithinDays));
        var data = await db.TonKhos.AsNoTracking().Where(s => s.MaKho == DefaultWarehouseId && s.SoLuongTon > 0 &&
            s.ChiTietNhapKho.HanSuDung.HasValue && s.ChiTietNhapKho.HanSuDung <= limit)
            .Select(s => new { stockId = s.Id, itemId = s.MaItem, itemCode = s.Item.Ma,
                itemName = s.Item.Ten, batchNumber = s.ChiTietNhapKho.SoLo,
                expiryDate = s.ChiTietNhapKho.HanSuDung, quantity = s.SoLuongTon }).ToListAsync();
        if (data.Count == 0)
            logger.LogWarning("Inventory không có dữ liệu cảnh báo tồn kho. ExpiringWithinDays={ExpiringWithinDays}",
                expiringWithinDays);
        return InventoryResult.Ok(data);
    }

}
