using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;


namespace ClinicManagement.Application.Features.Kho;

// Xử lý vòng đời kiểm kê, điều chỉnh tồn và truy vấn sổ giao dịch.
public sealed partial class KhoService
{
        public async Task<InventoryResult> CreateStocktake(StocktakeCreateRequest request)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(CreateStocktake));
        if (replay is not null) return replay;
        var stocktake = new Stocktake { ReferenceCode = $"KK-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            Note = request.Note ?? string.Empty, CreatedByUserId = UserId };
        db.Add(stocktake);
        await db.SaveChangesAsync();
        var result = new { id = stocktake.Id, referenceCode = stocktake.ReferenceCode, status = stocktake.Status.ToString() };
        await SaveReplayAsync(request.IdempotencyKey, nameof(CreateStocktake), result);
        return InventoryResult.Ok(result);
    }

        public async Task<InventoryResult> CountStocktake(int id, StocktakeCountRequest request)
    {
        var stocktake = await db.Stocktakes.Include(x => x.Counts).FirstOrDefaultAsync(x => x.Id == id);
        var stock = await db.TonKhos.FirstOrDefaultAsync(x => x.Id == request.StockId && x.MaKho == DefaultWarehouseId);
        if (stocktake is null || stock is null) return InventoryResult.Error("Không tìm thấy đợt kiểm kê hoặc lô tồn.", 404);
        if (stocktake.Status != TrangThaiKiemKe.MOI_TAO || request.ActualQuantity < 0) return InventoryResult.Error("Đợt kiểm kê không còn mở.", 409);
        var count = stocktake.Counts.FirstOrDefault(x => x.MaTonKho == request.StockId);
        if (count is null) stocktake.Counts.Add(new StocktakeCount { MaTonKho = stock.Id, SystemQuantity = stock.SoLuongTon,
            ActualQuantity = request.ActualQuantity, Reason = request.Reason ?? string.Empty });
        else { count.ActualQuantity = request.ActualQuantity; count.Reason = request.Reason ?? string.Empty; }
        await db.SaveChangesAsync();
        return InventoryResult.Ok(new { stocktakeId = id, stockId = request.StockId, actualQuantity = request.ActualQuantity });
    }

        public async Task<InventoryResult> SubmitStocktake(int id)
    {
        var stocktake = await db.Stocktakes.FirstOrDefaultAsync(x => x.Id == id);
        if (stocktake is null) return InventoryResult.Error("Không tìm thấy đợt kiểm kê.", 404);
        try { stocktake.Submit(UserId); } catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }
        await db.SaveChangesAsync();
        return InventoryResult.Ok(new { id, status = stocktake.Status.ToString() });
    }


        public async Task<InventoryResult> ApproveStocktake(int id, StocktakeCountsRequest request)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(ApproveStocktake));
        if (replay is not null) return replay;
        var stocktake = await db.Stocktakes.Include(x => x.Counts).FirstOrDefaultAsync(x => x.Id == id);
        if (stocktake is null) return InventoryResult.Error("Không tìm thấy đợt kiểm kê.", 404);
        if (stocktake.Status == TrangThaiKiemKe.MOI_TAO)
            foreach (var count in request.Counts) await AddOrUpdateCount(stocktake, count);
        try { if (stocktake.Status == TrangThaiKiemKe.MOI_TAO) stocktake.Submit(); stocktake.Approve(UserId); }
        catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }
        await using var transaction = await db.BeginTransactionAsync();
        foreach (var count in stocktake.Counts)
        {
            var stock = await db.TonKhos.Include(x => x.ChiTietNhapKho).FirstOrDefaultAsync(x => x.Id == count.MaTonKho);
            if (stock is null || count.ActualQuantity < 0) return InventoryResult.Error("Dữ liệu kiểm kê không hợp lệ.", 409);
            var before = stock.SoLuongTon; var difference = count.ActualQuantity - before;
            if (difference == 0) continue;
            if (difference > 0) stock.AddQuantity(difference); else stock.SubtractQuantity(-difference);
            db.Add(new InventoryTransaction { LoaiGiaoDich = LoaiGiaoDichKho.DIEU_CHINH,
                MaItem = stock.MaItem, MaTonKho = stock.Id, SoLo = stock.ChiTietNhapKho.SoLo,
                SoLuongTruoc = before, SoLuongThayDoi = difference, SoLuongSau = stock.SoLuongTon,
                MaChungTu = stocktake.ReferenceCode, MaNguoiThucHien = UserId,
                IdempotencyKey = request.IdempotencyKey, GhiChu = count.Reason });
        }
        var result = new { id, status = stocktake.Status.ToString() };
        await SaveReplayAsync(request.IdempotencyKey, nameof(ApproveStocktake), result);
        await db.SaveChangesAsync(); await transaction.CommitAsync();
        return InventoryResult.Ok(result);
    }

        public Task<InventoryResult> FinalizeStocktake(int id, StocktakeCountsRequest request) => ApproveStocktake(id, request);
}
