using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;


namespace ClinicManagement.Application.Features.Kho;

// Xử lý trả nhà cung cấp, xuất hủy và hoàn thuốc từ bệnh nhân.
public sealed partial class KhoService
{
        public Task<InventoryResult> ReturnToSupplier(StockMutationRequest request)
        => MutateStock(request, LoaiGiaoDichKho.TRA_NCC, LoaiXuatKho.TRA_NCC);
        public Task<InventoryResult> WriteOff(StockMutationRequest request)
        => MutateStock(request, LoaiGiaoDichKho.HUY, LoaiXuatKho.HAO_HUT);


    private async Task<InventoryResult> MutateStock(StockMutationRequest request, LoaiGiaoDichKho transactionType, LoaiXuatKho exportType)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, exportType.ToString());
        if (replay is not null) return replay;
        await using var transaction = await db.BeginTransactionAsync();
        var stock = await db.TonKhos.Include(x => x.ChiTietNhapKho).FirstOrDefaultAsync(x => x.Id == request.StockId);
        if (stock is null) return InventoryResult.Error("Không tìm thấy lô tồn.", 404);
        if (request.Quantity <= 0 || request.Quantity > stock.SoLuongTon) return InventoryResult.Error("Số lượng xuất không hợp lệ.", 409);
        var before = stock.SoLuongTon; stock.SubtractQuantity(request.Quantity);
        var reference = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
        db.Add(new InventoryTransaction { LoaiGiaoDich = transactionType, MaItem = stock.MaItem,
            MaTonKho = stock.Id, SoLo = stock.ChiTietNhapKho.SoLo, SoLuongTruoc = before,
            SoLuongThayDoi = -request.Quantity, SoLuongSau = stock.SoLuongTon, MaChungTu = reference,
            MaNguoiThucHien = UserId, IdempotencyKey = request.IdempotencyKey, GhiChu = request.Reason });
        await db.SaveChangesAsync();
        var result = new { stockId = stock.Id, referenceCode = reference, quantity = request.Quantity };
        await SaveReplayAsync(request.IdempotencyKey, exportType.ToString(), result);
        await transaction.CommitAsync();
        return InventoryResult.Ok(result);
    }
        public async Task<InventoryResult> ReturnFromPatient(PatientReturnRequest request)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(ReturnFromPatient));
        if (replay is not null) return replay;
        if (!await db.DonThuocs.AnyAsync(x => x.Id == request.PrescriptionId))
            return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);
        await using var transaction = await db.BeginTransactionAsync();
        foreach (var line in request.Items)
        {
            if (line.Quantity <= 0) return InventoryResult.Error("Số lượng hoàn không hợp lệ.");
            var source = await db.TonKhos.Include(x => x.ChiTietNhapKho)
                .FirstOrDefaultAsync(x => x.MaItem == line.ItemId && x.MaKho == DefaultWarehouseId &&
                    x.ChiTietNhapKho.SoLo == line.BatchNumber);
            if (source is null) return InventoryResult.Error("Không xác định được lô thuốc hoàn.", 409);

            // Kiểm tra không hoàn nhiều hơn số lượng đã xuất trong đơn
            var dispensed = await db.ChiTietDonThuocs
                .Where(x => x.MaDonThuoc == request.PrescriptionId && x.MaItem == line.ItemId)
                .SumAsync(x => x.SoLuongDaXuat);
            if (line.Quantity > dispensed) return InventoryResult.Error($"Số lượng hoàn ({line.Quantity}) vượt quá số đã cấp ({dispensed}).", 409);

            if (line.Condition.Equals("SEALED", StringComparison.OrdinalIgnoreCase))
            {
                // Còn nguyên niêm phong → cộng lại tồn, ghi NHAP_TRA_BENH_NHAN
                var before = source.SoLuongTon; source.AddQuantity(line.Quantity);
                db.Add(new InventoryTransaction {
                    LoaiGiaoDich = LoaiGiaoDichKho.NHAP_TRA_BENH_NHAN,
                    MaItem = line.ItemId, MaTonKho = source.Id, SoLo = line.BatchNumber,
                    SoLuongTruoc = before, SoLuongThayDoi = line.Quantity, SoLuongSau = source.SoLuongTon,
                    MaChungTu = $"TH-{request.PrescriptionId}",
                    MaNguoiThucHien = UserId, IdempotencyKey = request.IdempotencyKey,
                    GhiChu = request.Reason });
            }
            else
            {
                // Đã mở bao bì / không xác định điều kiện → ghi HUY, không cộng tồn
                db.Add(new InventoryTransaction {
                    LoaiGiaoDich = LoaiGiaoDichKho.HUY,
                    MaItem = line.ItemId, MaTonKho = source.Id, SoLo = line.BatchNumber,
                    MaChungTu = $"TH-{request.PrescriptionId}",
                    MaNguoiThucHien = UserId, IdempotencyKey = request.IdempotencyKey,
                    GhiChu = $"{request.Reason}: {line.Condition}" });
            }
        }
        var result = new { prescriptionId = request.PrescriptionId, status = "DA_XU_LY" };
        await SaveReplayAsync(request.IdempotencyKey, nameof(ReturnFromPatient), result);
        await db.SaveChangesAsync(); await transaction.CommitAsync();
        return InventoryResult.Ok(result);
    }
}
