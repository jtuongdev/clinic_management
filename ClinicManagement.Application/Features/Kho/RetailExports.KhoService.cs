using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;


namespace ClinicManagement.Application.Features.Kho;

// Xử lý bán/cấp thuốc theo lượt khám và các phiếu xuất dùng nội bộ.
public sealed partial class KhoService
{
        public Task<InventoryResult> Retail(ExportRequest request) => RetailExport(request);

        public Task<InventoryResult> InternalUse(ExportRequest request) => Export(request, LoaiXuatKho.XUAT_THU_THUAT, LoaiGiaoDichKho.XUAT_THU_THUAT);

    private async Task<InventoryResult> RetailExport(ExportRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdempotencyKey))
            return InventoryResult.Error("IdempotencyKey là bắt buộc.");
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(Retail));
        if (replay is not null) return replay;
        if (request.VisitId <= 0) return InventoryResult.Error("VisitId là bắt buộc.");

        var lines = request.Items?.ToList() ?? [];
        if (lines.Count == 0) return InventoryResult.Error("Phiếu xuất phải có ít nhất một dòng.");
        if (request.PaidAmount < 0) return InventoryResult.Error("INVALID_PAID_AMOUNT");

        PhuongThucThanhToan paymentMethod = default;
        if (request.PaidAmount > 0)
        {
            if (string.IsNullOrWhiteSpace(request.PaymentMethod) ||
                !Enum.TryParse(request.PaymentMethod, true, out paymentMethod) ||
                !Enum.IsDefined(paymentMethod))
                return InventoryResult.Error("INVALID_PAYMENT_METHOD");
        }

        var visit = await db.LuotKhams.FirstOrDefaultAsync(x => x.Id == request.VisitId);
        if (visit is null) return InventoryResult.Error("Không tìm thấy lượt khám.", 404);
        if (visit.TrangThai is TrangThaiLuotKham.CHO_KHAM or TrangThaiLuotKham.DA_HUY)
            return InventoryResult.Error("Lượt khám chưa ở trạng thái cho phép cấp thuốc.", 409);
        var prescription = await db.DonThuocs.Include(x => x.ChiTietDonThuocs)
            .FirstOrDefaultAsync(x => x.MaLuotKham == visit.Id && x.MaCoSo == visit.MaCoSo &&
                x.TrangThai == TrangThaiDonThuoc.DA_DUYET);
        if (prescription is null)
            return InventoryResult.Error("Lượt khám chưa có đơn thuốc đã duyệt.", 409);

        var requested = new Dictionary<int, (decimal Quantity, ExportItem Source)>();
        foreach (var line in lines)
        {
            if (line.Quantity <= 0) return InventoryResult.Error("Số lượng phải lớn hơn 0.");
            if (requested.ContainsKey(line.ItemId))
                return InventoryResult.Error("Không được lặp mặt hàng trong phiếu xuất.");
            requested[line.ItemId] = (line.Quantity, line);
        }
        var prescriptionLines = prescription.ChiTietDonThuocs
            .Where(x => x.RemainingQuantity() > 0).ToDictionary(x => x.MaItem);
        foreach (var itemId in requested.Keys)
            if (!prescriptionLines.ContainsKey(itemId))
                return InventoryResult.Error($"Mặt hàng {itemId} không thuộc đơn thuốc đã duyệt.", 409);
        foreach (var (itemId, requestedLine) in requested)
        {
            var prescriptionLine = prescriptionLines[itemId];
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == itemId && x.IsActive);
            if (item is null) return InventoryResult.Error($"Mặt hàng {itemId} không tồn tại.", 404);
            var baseQuantity = await ToBaseQuantity(item, requestedLine.Quantity, requestedLine.Source.Unit);
            if (baseQuantity <= 0 || baseQuantity > prescriptionLine.RemainingQuantity())
                return InventoryResult.Error($"Số lượng mặt hàng {item.Ma} vượt quá đơn thuốc.", 409);
        }

        await using var transaction = await db.BeginTransactionAsync();
        var export = new PhieuXuatKho
        {
            MaPhieu = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            LoaiXuat = LoaiXuatKho.BAN_THUOC, MaKhoXuat = DefaultWarehouseId,
            MaNguoiXuat = UserId, MaDonThuoc = prescription.Id, GhiChu = request.Note ?? string.Empty
        };
        var allocations = new List<object>();
        var invoice = new ClinicManagement.Domain.Billing.HoaDon(
            visit.Id, visit.MaBenhNhan, visit.MaCoSo,
            $"HD-{DateTime.UtcNow:yyyyMMddHHmmssfff}", UserId);

        foreach (var (itemId, requestedLine) in requested)
        {
            var prescriptionLine = prescriptionLines[itemId];
            var item = await db.Items.FirstAsync(x => x.Id == itemId);
            var need = await ToBaseQuantity(item, requestedLine.Quantity, requestedLine.Source.Unit);
            var effectivePrice = requestedLine.Source.UnitPrice ?? item.GiaBanLe;
            if (effectivePrice < 0) return InventoryResult.Error("Giá bán không được âm.");
            var batches = await db.TonKhos.Include(x => x.ChiTietNhapKho)
                .Where(x => x.MaKho == DefaultWarehouseId && x.MaItem == item.Id && x.SoLuongTon > 0 &&
                    (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(x => x.ChiTietNhapKho.HanSuDung).ToListAsync();
            if (batches.Sum(x => x.SoLuongTon) < need)
                return InventoryResult.Error("INSUFFICIENT_STOCK", 409);

            var itemAllocations = new List<object>();
            foreach (var batch in batches)
            {
                var quantity = Math.Min(need, batch.SoLuongTon);
                var before = batch.SoLuongTon;
                batch.SubtractQuantity(quantity);
                export.ChiTietXuatKhos.Add(new ChiTietXuatKho
                {
                    ChiTietNhapKho = batch.ChiTietNhapKho, SoLuongXuat = quantity, DonGiaXuat = effectivePrice
                });
                db.Add(new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.XUAT_BAN_LE, MaItem = item.Id, MaTonKho = batch.Id,
                    SoLo = batch.ChiTietNhapKho.SoLo, SoLuongTruoc = before, SoLuongThayDoi = -quantity,
                    SoLuongSau = batch.SoLuongTon, MaChungTu = export.MaPhieu, MaNguoiThucHien = UserId,
                    IdempotencyKey = request.IdempotencyKey
                });
                prescriptionLine.UpdateDispensedQuantity(quantity);
                itemAllocations.Add(new { itemId = item.Id, batchNumber = batch.ChiTietNhapKho.SoLo,
                    quantity, unitPrice = effectivePrice });
                need -= quantity;
                if (need == 0) break;
            }
            invoice.AddServiceOrDrug("THUOC", item.Id, item.Ten, await ToBaseQuantity(item, requestedLine.Quantity, requestedLine.Source.Unit), effectivePrice);
            allocations.AddRange(itemAllocations);
        }

        if (prescription.ChiTietDonThuocs.All(x => x.IsFullyDispensed()))
            prescription.CompleteDispense(UserId);
        db.Add(export);
        db.Add(invoice);
        try
        {
            await db.SaveChangesAsync();
            var total = invoice.TongTien;
            if (request.PaidAmount > total)
                return InventoryResult.Error("INVALID_PAID_AMOUNT");
            if (request.PaidAmount > 0) invoice.RecordPayment(request.PaidAmount, paymentMethod, UserId);
            await db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return InventoryResult.Error("CONCURRENCY_CONFLICT", 409);
        }

        var receipt = invoice.PhieuThus.SingleOrDefault();
        var result = new
        {
            exportReceiptId = export.Id, exportReferenceCode = export.MaPhieu,
            invoiceId = invoice.Id, invoiceNumber = invoice.SoHoaDon,
            receiptId = receipt?.Id, receiptNumber = receipt?.SoPhieuThu,
            totalAmount = invoice.TongTien, paidAmount = invoice.DaThanhToan,
            remainingAmount = invoice.SoTienConNo(), paymentStatus = invoice.TrangThai.ToString(),
            allocations
        };
        await SaveReplayAsync(request.IdempotencyKey, nameof(Retail), result);
        await transaction.CommitAsync();
        return InventoryResult.Ok(result);
    }

    private async Task<InventoryResult> Export(ExportRequest request, LoaiXuatKho exportType, LoaiGiaoDichKho transactionType)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, exportType.ToString());
        if (replay is not null) return replay;
        await using var transaction = await db.BeginTransactionAsync();
        var lines = request.Items.ToList();
        if (lines.Count == 0) return InventoryResult.Error("Phiếu xuất phải có ít nhất một dòng.");
        var export = new PhieuXuatKho { MaPhieu = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}", LoaiXuat = exportType,
            MaKhoXuat = DefaultWarehouseId, MaNguoiXuat = UserId, GhiChu = request.Note ?? string.Empty };
        foreach (var line in lines)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại.", 404);
            var need = await ToBaseQuantity(item, line.Quantity, line.Unit);
            var effectivePrice = line.UnitPrice ?? item.GiaBanLe;
            // Audit khi giá bán khác giá danh mục (§18 — sửa giá phải ghi audit)
            if (line.UnitPrice.HasValue && line.UnitPrice != item.GiaBanLe)
            {
                db.Add(new InventoryTransaction {
                    LoaiGiaoDich = LoaiGiaoDichKho.XUAT_BAN_LE,
                    MaItem = line.ItemId, MaChungTu = $"GIA-OVERRIDE-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                    MaNguoiThucHien = UserId,
                    GhiChu = $"Giá bán {effectivePrice} khác giá danh mục {item.GiaBanLe}" });
            }
            var batches = await db.TonKhos.Include(x => x.ChiTietNhapKho).Where(x => x.MaKho == DefaultWarehouseId &&
                x.MaItem == line.ItemId && x.SoLuongTon > 0 &&
                (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(x => x.ChiTietNhapKho.HanSuDung).ToListAsync();
            if (batches.Sum(x => x.SoLuongTon) < need) return InventoryResult.Error($"Không đủ tồn kho cho {item.Ma}.", 409);
            foreach (var batch in batches)
            {
                var quantity = Math.Min(need, batch.SoLuongTon); var before = batch.SoLuongTon; batch.SubtractQuantity(quantity);
                export.ChiTietXuatKhos.Add(new ChiTietXuatKho { ChiTietNhapKho = batch.ChiTietNhapKho,
                    SoLuongXuat = quantity, DonGiaXuat = effectivePrice });
                db.Add(new InventoryTransaction { LoaiGiaoDich = transactionType, MaItem = line.ItemId,
                    MaTonKho = batch.Id, SoLo = batch.ChiTietNhapKho.SoLo, SoLuongTruoc = before,
                    SoLuongThayDoi = -quantity, SoLuongSau = batch.SoLuongTon, MaChungTu = export.MaPhieu,
                    MaNguoiThucHien = UserId, IdempotencyKey = request.IdempotencyKey });
                need -= quantity; if (need == 0) break;
            }
        }

        db.Add(export); await db.SaveChangesAsync();
        var result = new { exportReceiptId = export.Id, referenceCode = export.MaPhieu };
        await SaveReplayAsync(request.IdempotencyKey, exportType.ToString(), result);
        await transaction.CommitAsync();
        return InventoryResult.Ok(result);
    }

}
