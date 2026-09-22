using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.DTOs.Kho.CapPhat;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace ClinicManagement.Application.Features.Kho;

// Xử lý phiếu nhập kho, duyệt nhập và cấp phát thuốc theo đơn.
public sealed partial class KhoService
{
        public async Task<InventoryResult> ImportReceipts(
            string? keyword,
            TrangThaiPhieuNhap? status,
            DateTime? fromDate,
            DateTime? toDate,
            int pageIndex = 1,
            int pageSize = 20)
        {
            pageIndex = Math.Max(1, pageIndex);
            pageSize = Math.Clamp(pageSize, 1, 100);
            keyword = keyword?.Trim();

            var query = db.PhieuNhapKhos
                .AsNoTracking()
                .Where(x => !x.IsDeleted);

            if (status.HasValue)
                query = query.Where(x => x.TrangThai == status.Value);

            if (fromDate.HasValue)
                query = query.Where(x => x.NgayNhap >= fromDate.Value.Date);

            if (toDate.HasValue)
            {
                var exclusiveEnd = toDate.Value.Date.AddDays(1);
                query = query.Where(x => x.NgayNhap < exclusiveEnd);
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x =>
                    x.MaPhieu.Contains(keyword) ||
                    x.NhaCungCap.Ma.Contains(keyword) ||
                    x.NhaCungCap.Ten.Contains(keyword) ||
                    x.ChiTietNhapKhos.Any(detail =>
                        detail.Item.Ma.Contains(keyword) ||
                        detail.Item.Ten.Contains(keyword)));
            }

            var total = await query.CountAsync();
            var receipts = await query
                .OrderByDescending(x => x.NgayNhap)
                .ThenByDescending(x => x.Id)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    id = x.Id,
                    referenceCode = x.MaPhieu,
                    receivedAt = x.NgayNhap,
                    totalAmount = x.TongTien,
                    status = x.TrangThai.ToString(),
                    note = x.GhiChu,
                    facility = new
                    {
                        id = x.CoSo.Id,
                        code = x.CoSo.Ma,
                        name = x.CoSo.Ten
                    },
                    warehouse = new
                    {
                        id = x.Kho.Id,
                        name = x.Kho.TenKho,
                        address = x.Kho.DiaChi
                    },
                    supplier = new
                    {
                        id = x.NhaCungCap.Id,
                        code = x.NhaCungCap.Ma,
                        name = x.NhaCungCap.Ten,
                        address = x.NhaCungCap.DiaChi,
                        phone = x.NhaCungCap.DienThoai,
                        taxCode = x.NhaCungCap.MaSoThue
                    },
                    receivedBy = new
                    {
                        id = x.NguoiNhap.Id,
                        name = x.NguoiNhap.HoTen
                    },
                    lines = x.ChiTietNhapKhos
                        .OrderBy(detail => detail.Id)
                        .Select(detail => new
                        {
                            id = detail.Id,
                            itemId = detail.MaItem,
                            itemCode = detail.Item.Ma,
                            itemName = detail.Item.Ten,
                            itemType = detail.Item.LoaiItem.ToString(),
                            baseUnit = detail.Item.DonViTinhCoBan,
                            quantity = detail.SoLuong,
                            purchasePrice = detail.DonGiaNhap,
                            lineAmount = detail.SoLuong * detail.DonGiaNhap,
                            batchNumber = detail.SoLo,
                            expiryDate = detail.HanSuDung,
                            location = detail.ViTri,
                            stockId = detail.TonKho == null ? (int?)null : detail.TonKho.Id,
                            stockQuantity = detail.TonKho == null ? (decimal?)null : detail.TonKho.SoLuongTon
                        })
                        .ToList()
                })
                .ToListAsync();

            if (receipts.Count == 0)
            {
                logger.LogWarning(
                    "Không có phiếu nhập kho phù hợp. Keyword={Keyword}, Status={Status}, FromDate={FromDate}, ToDate={ToDate}, PageIndex={PageIndex}, PageSize={PageSize}",
                    keyword, status, fromDate, toDate, pageIndex, pageSize);
            }

            return InventoryResult.Ok(new
            {
                items = receipts,
                total,
                pageIndex,
                pageSize
            });
        }

    private async Task<(decimal baseQuantity, decimal basePrice, decimal lineTotal)> CalculateImportQuantityAndPrice(
        Item item, decimal quantity, decimal purchasePrice, string? unit)
    {
        if (quantity <= 0 || purchasePrice < 0) return (0, 0, 0);
        decimal factor = 1m;
        if (!string.IsNullOrWhiteSpace(unit) && !unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase))
        {
            var conversion = await db.DonViTinhQuyDois.FirstOrDefaultAsync(x => x.MaItem == item.Id && x.DonVi == unit);
            if (conversion is null || conversion.HeSo <= 0) return (0, 0, 0);
            factor = conversion.HeSo;
        }

        var baseQuantity = quantity * factor;
        var basePrice = purchasePrice / factor;
        var lineTotal = quantity * purchasePrice;
        return (baseQuantity, basePrice, lineTotal);
    }

    public async Task<InventoryResult> Import(ImportRequest request)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(Import));
        if (replay is not null) return replay;
        var supplier = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == request.SupplierId);
        if (supplier is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp.", 404);
        if (supplier.TrangThai != TrangThaiNhaCungCap.HoatDong) return InventoryResult.Error("Nhà cung cấp đã ngừng hợp tác.", 409);
        var items = request.Items.ToList();
        if (items.Count == 0) return InventoryResult.Error("Phiếu nhập phải có ít nhất một dòng.");

        var warehouseId = (request.WarehouseId.HasValue && request.WarehouseId.Value > 0)
            ? request.WarehouseId.Value
            : DefaultWarehouseId;
        var warehouse = await db.Khos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == warehouseId);
        if (warehouse is null)
        {
            warehouse = await db.Khos
                .AsNoTracking()
                .Where(x => x.TrangThai == TrangThaiKho.HoatDong)
                .OrderBy(x => x.Id)
                .FirstOrDefaultAsync();
            warehouseId = warehouse?.Id ?? warehouseId;
        }
        if (warehouse is null)
            return InventoryResult.Error("Chưa cấu hình kho nhập hợp lệ trong hệ thống.", 409);
        if (warehouse.TrangThai != TrangThaiKho.HoatDong)
            return InventoryResult.Error("Kho nhập đang ngừng hoạt động.", 409);

        await using var transaction = await db.BeginTransactionAsync();
        var receipt = new PhieuNhapKho
        {
            MaPhieu = $"PN-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            MaCoSo = warehouse.MaCoSo,
            MaKho = warehouseId,
            MaNhaCungCap = request.SupplierId,
            NgayNhap = request.ReceivedAt,
            MaNguoiNhap = UserId,
            GhiChu = request.Note ?? string.Empty,
            NhaCungCap = supplier
        };

        foreach (var line in items)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);

            if (string.IsNullOrWhiteSpace(line.BatchNumber))
                return InventoryResult.Error($"Số lô của mặt hàng '{item.Ten}' không được để trống.");

            if (item.LoaiItem == LoaiItem.THUOC)
            {
                if (!line.ExpiryDate.HasValue || line.ExpiryDate.Value.Date <= DateTime.UtcNow.Date)
                    return InventoryResult.Error($"Thuốc '{item.Ten}' đã hết hạn sử dụng hoặc hạn dùng không hợp lệ.");
            }

            var (baseQuantity, basePrice, lineTotal) = await CalculateImportQuantityAndPrice(item, line.Quantity, line.PurchasePrice, line.Unit);
            if (baseQuantity <= 0)
                return InventoryResult.Error($"Số lượng hoặc đơn vị quy đổi của mặt hàng '{item.Ten}' không hợp lệ.");

            var detail = new ChiTietNhapKho
            {
                Item = item,
                SoLuong = baseQuantity,
                DonGiaNhap = basePrice,
                SoLo = line.BatchNumber.Trim(),
                HanSuDung = line.ExpiryDate
            };
            receipt.ChiTietNhapKhos.Add(detail);
            receipt.TongTien += lineTotal;
        }

        receipt.TrangThai = request.SaveDraft ? TrangThaiPhieuNhap.CHO_DUYET : TrangThaiPhieuNhap.DA_NHAP;
        db.Add(receipt);
        await db.SaveChangesAsync();

        if (!request.SaveDraft)
        {
            foreach (var detail in receipt.ChiTietNhapKhos)
            {
                var stock = new TonKho
                {
                    MaKho = warehouseId,
                    MaItem = detail.MaItem,
                    MaChiTietNhap = detail.Id,
                    SoLuongTon = detail.SoLuong,
                    NgayCapNhatCuoi = DateTime.UtcNow
                };
                db.Add(stock);

                var tx = new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.NHAP,
                    MaItem = detail.MaItem,
                    TonKho = stock, // Navigation Property fixes Foreign Key constraint!
                    SoLo = detail.SoLo,
                    SoLuongThayDoi = detail.SoLuong,
                    SoLuongSau = detail.SoLuong,
                    MaChungTu = receipt.MaPhieu,
                    MaNguoiThucHien = UserId,
                    IdempotencyKey = request.IdempotencyKey ?? string.Empty
                };
                db.Add(tx);
            }
            await db.SaveChangesAsync();
        }

        var result = new { id = receipt.Id, referenceCode = receipt.MaPhieu, status = receipt.TrangThai.ToString() };
        await SaveReplayAsync(request.IdempotencyKey, nameof(Import), result);
        await transaction.CommitAsync();
        return InventoryResult.Ok(result);
    }

    public async Task<InventoryResult> GetPendingPurchaseOrders(int? supplierId)
    {
        var query = db.DonDatHangs.AsNoTracking()
            .Include(x => x.NhaCungCap)
            .Include(x => x.Kho)
            .Include(x => x.ChiTietDonDatHangs)
            .Where(x => !x.IsDeleted && (x.TrangThai == TrangThaiDonDatHang.DA_DAT || x.TrangThai == TrangThaiDonDatHang.GIAO_MOT_PHAN));

        if (supplierId.HasValue && supplierId.Value > 0)
        {
            query = query.Where(x => x.MaNhaCungCap == supplierId.Value);
        }

        var orders = await query
            .OrderByDescending(x => x.NgayDat)
            .Select(x => new PurchaseOrderPendingDto(
                x.Id,
                x.MaDonDatHang,
                x.MaNhaCungCap,
                x.NhaCungCap.Ma,
                x.NhaCungCap.Ten,
                x.MaKho,
                x.Kho.TenKho,
                x.NgayDat,
                x.NgayDuKienGiao,
                x.TongTien,
                x.TrangThai.ToString(),
                x.ChiTietDonDatHangs.Count,
                x.GhiChu
            ))
            .ToListAsync();

        return InventoryResult.Ok(orders);
    }

    public async Task<InventoryResult> GetPurchaseOrderForImport(int id)
    {
        var po = await db.DonDatHangs.AsNoTracking()
            .Include(x => x.NhaCungCap)
            .Include(x => x.Kho)
            .Include(x => x.ChiTietDonDatHangs)
                .ThenInclude(ct => ct.Item)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        if (po is null)
            return InventoryResult.Error("Không tìm thấy đơn đặt hàng.", 404);

        if (po.TrangThai == TrangThaiDonDatHang.HOAN_THANH || po.TrangThai == TrangThaiDonDatHang.DA_HUY)
            return InventoryResult.Error("Đơn đặt hàng này đã hoàn tất hoặc đã bị hủy.", 409);

        var dateStr = DateTime.UtcNow.ToString("yyMMdd");
        var rand = new Random();

        var lines = po.ChiTietDonDatHangs
            .OrderBy(ct => ct.Id)
            .Select(ct =>
            {
                var remaining = ct.SoLuongConLai;
                var rawCode = !string.IsNullOrWhiteSpace(ct.Item.Ma) ? ct.Item.Ma : "LOT";
                var codePart = new string(rawCode.Where(char.IsLetterOrDigit).ToArray());
                if (codePart.Length > 4) codePart = codePart[..4];
                if (string.IsNullOrEmpty(codePart)) codePart = "LOT";
                var defaultBatch = $"L{dateStr}-{codePart.ToUpper()}{rand.Next(100, 999)}";

                return new PurchaseOrderForImportLineDto(
                    ct.Id,
                    ct.MaItem,
                    ct.Item.Ma,
                    ct.Item.Ten,
                    ct.Item.LoaiItem.ToString(),
                    !string.IsNullOrWhiteSpace(ct.DonViTinh) ? ct.DonViTinh : ct.Item.DonViTinhCoBan,
                    ct.SoLuongDat,
                    ct.SoLuongDaNhap,
                    remaining,
                    ct.DonGiaDat,
                    defaultBatch
                );
            })
            .ToList();

        var result = new PurchaseOrderForImportDto(
            po.Id,
            po.MaDonDatHang,
            po.MaNhaCungCap,
            po.NhaCungCap.Ma,
            po.NhaCungCap.Ten,
            po.MaKho,
            po.Kho.TenKho,
            po.NgayDat,
            po.NgayDuKienGiao,
            po.TongTien,
            po.TrangThai.ToString(),
            po.GhiChu,
            lines
        );

        return InventoryResult.Ok(result);
    }

    public async Task<InventoryResult> CreateImportFromPo(CreateImportFromPoRequest request)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(CreateImportFromPo));
        if (replay is not null) return replay;

        var po = await db.DonDatHangs
            .Include(x => x.ChiTietDonDatHangs)
            .FirstOrDefaultAsync(x => x.Id == request.PurchaseOrderId && !x.IsDeleted);

        if (po is null)
            return InventoryResult.Error("Không tìm thấy đơn đặt hàng.", 404);

        if (po.TrangThai != TrangThaiDonDatHang.DA_DAT && po.TrangThai != TrangThaiDonDatHang.GIAO_MOT_PHAN)
            return InventoryResult.Error("Đơn đặt hàng không ở trạng thái chờ giao hàng.", 409);

        var linesToImport = request.Lines?.Where(l => l.Quantity > 0).ToList();
        if (linesToImport is null || linesToImport.Count == 0)
            return InventoryResult.Error("Phiếu nhập từ PO phải có ít nhất một mặt hàng với số lượng nhận lớn hơn 0.");

        var supplier = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == po.MaNhaCungCap);
        if (supplier is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp.", 404);
        if (supplier.TrangThai != TrangThaiNhaCungCap.HoatDong) return InventoryResult.Error("Nhà cung cấp đã ngừng hợp tác.", 409);

        var warehouseId = (request.WarehouseId.HasValue && request.WarehouseId.Value > 0)
            ? request.WarehouseId.Value
            : po.MaKho;

        var warehouse = await db.Khos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == warehouseId);
        if (warehouse is null)
            return InventoryResult.Error("Không tìm thấy kho tiếp nhận hợp lệ.", 409);

        await using var transaction = await db.BeginTransactionAsync();

        var receipt = new PhieuNhapKho
        {
            MaPhieu = $"PN-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            MaCoSo = warehouse.MaCoSo,
            MaKho = warehouseId,
            MaNhaCungCap = po.MaNhaCungCap,
            MaDonDatHang = po.Id,
            NgayNhap = request.ReceivedAt,
            MaNguoiNhap = UserId,
            GhiChu = string.IsNullOrWhiteSpace(request.Note)
                ? $"Nhập kho theo đơn đặt hàng #{po.MaDonDatHang}"
                : $"{request.Note.Trim()} (Nhập theo PO #{po.MaDonDatHang})",
            NhaCungCap = supplier,
            DonDatHang = po
        };

        foreach (var line in linesToImport)
        {
            var poDetail = po.ChiTietDonDatHangs.FirstOrDefault(d => d.Id == line.PoDetailId);
            if (poDetail is null)
                return InventoryResult.Error($"Dòng chi tiết đơn đặt hàng #{line.PoDetailId} không tồn tại trên PO này.");

            var remaining = poDetail.SoLuongConLai;
            if (line.Quantity > remaining)
            {
                return InventoryResult.Error(
                    $"Số lượng nhận của mặt hàng #{poDetail.MaItem} ({line.Quantity}) vượt quá số lượng còn lại của đơn đặt hàng ({remaining}).");
            }

            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null)
                return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);

            if (string.IsNullOrWhiteSpace(line.BatchNumber))
                return InventoryResult.Error($"Số lô của mặt hàng '{item.Ten}' không được để trống.");

            if (item.LoaiItem == LoaiItem.THUOC)
            {
                if (!line.ExpiryDate.HasValue || line.ExpiryDate.Value.Date <= DateTime.UtcNow.Date)
                    return InventoryResult.Error($"Thuốc '{item.Ten}' chưa có hạn dùng hoặc hạn dùng không hợp lệ.");
            }

            var (baseQuantity, basePrice, lineTotal) = await CalculateImportQuantityAndPrice(item, line.Quantity, line.PurchasePrice, line.Unit);
            if (baseQuantity <= 0)
                return InventoryResult.Error($"Số lượng hoặc đơn vị quy đổi của mặt hàng '{item.Ten}' không hợp lệ.");

            var detail = new ChiTietNhapKho
            {
                Item = item,
                MaChiTietDonDatHang = poDetail.Id,
                ChiTietDonDatHang = poDetail,
                SoLuong = baseQuantity,
                DonGiaNhap = basePrice,
                SoLo = line.BatchNumber.Trim(),
                HanSuDung = line.ExpiryDate
            };
            receipt.ChiTietNhapKhos.Add(detail);
            receipt.TongTien += lineTotal;

            // Cập nhật số lượng đã nhận lũy kế trên dòng PO
            poDetail.SoLuongDaNhap += line.Quantity;
        }

        // Tính lại trạng thái PO: GIAO_MOT_PHAN hoặc HOAN_THANH
        po.RecalculateStatus();

        receipt.TrangThai = request.SaveDraft ? TrangThaiPhieuNhap.CHO_DUYET : TrangThaiPhieuNhap.DA_NHAP;
        db.Add(receipt);
        await db.SaveChangesAsync();

        if (!request.SaveDraft)
        {
            foreach (var detail in receipt.ChiTietNhapKhos)
            {
                var stock = new TonKho
                {
                    MaKho = warehouseId,
                    MaItem = detail.MaItem,
                    MaChiTietNhap = detail.Id,
                    SoLuongTon = detail.SoLuong,
                    NgayCapNhatCuoi = DateTime.UtcNow
                };
                db.Add(stock);

                var tx = new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.NHAP,
                    MaItem = detail.MaItem,
                    TonKho = stock, // Navigation property prevents FK constraints!
                    SoLo = detail.SoLo,
                    SoLuongThayDoi = detail.SoLuong,
                    SoLuongSau = detail.SoLuong,
                    MaChungTu = receipt.MaPhieu,
                    MaNguoiThucHien = UserId,
                    IdempotencyKey = request.IdempotencyKey ?? string.Empty
                };
                db.Add(tx);
            }
            await db.SaveChangesAsync();
        }

        var result = new
        {
            id = receipt.Id,
            referenceCode = receipt.MaPhieu,
            status = receipt.TrangThai.ToString(),
            purchaseOrderId = po.Id,
            purchaseOrderStatus = po.TrangThai.ToString()
        };

        await SaveReplayAsync(request.IdempotencyKey, nameof(CreateImportFromPo), result);
        await transaction.CommitAsync();

        return InventoryResult.Ok(result);
    }

    public async Task<InventoryResult> UpdateImport(int id, ImportRequest request)
    {
        var receipt = await db.PhieuNhapKhos.Include(x => x.ChiTietNhapKhos).FirstOrDefaultAsync(x => x.Id == id);
        if (receipt is null) return InventoryResult.Error("Không tìm thấy phiếu nhập.", 404);
        if (receipt.TrangThai != TrangThaiPhieuNhap.CHO_DUYET && receipt.TrangThai != TrangThaiPhieuNhap.TAM)
            return InventoryResult.Error("Chỉ có thể chỉnh sửa phiếu nhập ở trạng thái chờ duyệt hoặc tạm.", 409);

        var supplier = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == request.SupplierId);
        if (supplier is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp.", 404);
        if (supplier.TrangThai != TrangThaiNhaCungCap.HoatDong) return InventoryResult.Error("Nhà cung cấp đã ngừng hợp tác.", 409);

        var items = request.Items.ToList();
        if (items.Count == 0) return InventoryResult.Error("Phiếu nhập phải có ít nhất một dòng.");

        var warehouseId = (request.WarehouseId.HasValue && request.WarehouseId.Value > 0)
            ? request.WarehouseId.Value
            : DefaultWarehouseId;

        await using var transaction = await db.BeginTransactionAsync();

        receipt.MaNhaCungCap = request.SupplierId;
        receipt.MaKho = warehouseId;
        receipt.NgayNhap = request.ReceivedAt;
        receipt.GhiChu = request.Note ?? string.Empty;
        receipt.TongTien = 0;

        // Xóa chi tiết cũ
        db.RemoveRange(receipt.ChiTietNhapKhos);
        receipt.ChiTietNhapKhos.Clear();

        foreach (var line in items)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);

            if (string.IsNullOrWhiteSpace(line.BatchNumber))
                return InventoryResult.Error($"Số lô của mặt hàng '{item.Ten}' không được để trống.");

            if (item.LoaiItem == LoaiItem.THUOC)
            {
                if (!line.ExpiryDate.HasValue || line.ExpiryDate.Value.Date <= DateTime.UtcNow.Date)
                    return InventoryResult.Error($"Thuốc '{item.Ten}' đã hết hạn sử dụng hoặc hạn dùng không hợp lệ.");
            }

            var (baseQuantity, basePrice, lineTotal) = await CalculateImportQuantityAndPrice(item, line.Quantity, line.PurchasePrice, line.Unit);
            if (baseQuantity <= 0)
                return InventoryResult.Error($"Số lượng hoặc đơn vị quy đổi của mặt hàng '{item.Ten}' không hợp lệ.");

            var detail = new ChiTietNhapKho
            {
                Item = item,
                SoLuong = baseQuantity,
                DonGiaNhap = basePrice,
                SoLo = line.BatchNumber.Trim(),
                HanSuDung = line.ExpiryDate
            };
            receipt.ChiTietNhapKhos.Add(detail);
            receipt.TongTien += lineTotal;
        }

        if (!request.SaveDraft)
        {
            receipt.TrangThai = TrangThaiPhieuNhap.DA_NHAP;
            await db.SaveChangesAsync();

            foreach (var detail in receipt.ChiTietNhapKhos)
            {
                var stock = new TonKho
                {
                    MaKho = warehouseId,
                    MaItem = detail.MaItem,
                    MaChiTietNhap = detail.Id,
                    SoLuongTon = detail.SoLuong,
                    NgayCapNhatCuoi = DateTime.UtcNow
                };
                db.Add(stock);

                var tx = new InventoryTransaction
                {
                    LoaiGiaoDich = LoaiGiaoDichKho.NHAP,
                    MaItem = detail.MaItem,
                    TonKho = stock,
                    SoLo = detail.SoLo,
                    SoLuongThayDoi = detail.SoLuong,
                    SoLuongSau = detail.SoLuong,
                    MaChungTu = receipt.MaPhieu,
                    MaNguoiThucHien = UserId,
                    IdempotencyKey = request.IdempotencyKey ?? string.Empty
                };
                db.Add(tx);
            }
        }
        else
        {
            receipt.TrangThai = TrangThaiPhieuNhap.CHO_DUYET;
        }

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return InventoryResult.Ok(new { id = receipt.Id, referenceCode = receipt.MaPhieu, status = receipt.TrangThai.ToString() });
    }

    public async Task<InventoryResult> CancelImport(int id, string? reason)
    {
        var receipt = await db.PhieuNhapKhos.FirstOrDefaultAsync(x => x.Id == id);
        if (receipt is null) return InventoryResult.Error("Không tìm thấy phiếu nhập.", 404);
        if (receipt.TrangThai == TrangThaiPhieuNhap.DA_HUY)
            return InventoryResult.Error("Phiếu nhập này đã bị hủy trước đó.", 409);
        if (receipt.TrangThai == TrangThaiPhieuNhap.DA_NHAP)
            return InventoryResult.Error("Không thể hủy phiếu nhập kho đã hoàn tất nhập hàng.", 409);

        receipt.Cancel();
        if (!string.IsNullOrWhiteSpace(reason))
        {
            receipt.GhiChu = string.IsNullOrWhiteSpace(receipt.GhiChu)
                ? $"[Lý do hủy: {reason.Trim()}]"
                : $"{receipt.GhiChu} | [Lý do hủy: {reason.Trim()}]";
        }

        await db.SaveChangesAsync();
        return InventoryResult.Ok(new { id, status = receipt.TrangThai.ToString() });
    }

    public async Task<InventoryResult> ApproveImport(int id)
    {
        var receipt = await db.PhieuNhapKhos.Include(x => x.ChiTietNhapKhos).FirstOrDefaultAsync(x => x.Id == id);
        if (receipt is null) return InventoryResult.Error("Không tìm thấy phiếu nhập.", 404);
        if (receipt.TrangThai != TrangThaiPhieuNhap.CHO_DUYET) return InventoryResult.Error("Phiếu nhập không ở trạng thái chờ duyệt.", 409);
        await using var transaction = await db.BeginTransactionAsync();
        receipt.Approve();
        foreach (var detail in receipt.ChiTietNhapKhos)
        {
            var stock = new TonKho
            {
                MaKho = receipt.MaKho,
                MaItem = detail.MaItem,
                MaChiTietNhap = detail.Id,
                SoLuongTon = detail.SoLuong,
                NgayCapNhatCuoi = DateTime.UtcNow
            };
            db.Add(stock);

            var tx = new InventoryTransaction
            {
                LoaiGiaoDich = LoaiGiaoDichKho.NHAP,
                MaItem = detail.MaItem,
                TonKho = stock, // Navigation Property fixes Foreign Key constraint!
                SoLo = detail.SoLo,
                SoLuongThayDoi = detail.SoLuong,
                SoLuongSau = detail.SoLuong,
                MaChungTu = receipt.MaPhieu,
                MaNguoiThucHien = UserId
            };
            db.Add(tx);
        }
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return InventoryResult.Ok(new { id, status = receipt.TrangThai.ToString() });
    }

    public async Task<InventoryResult> PendingPrescriptions(int pageIndex = 1, int pageSize = 20)
    {
        var query = db.DonThuocs.AsNoTracking()
            .Include(x => x.LuotKham).ThenInclude(lk => lk.BenhNhan)
            .Include(x => x.LuotKham).ThenInclude(lk => lk.HoaDons)
            .Include(x => x.BacSi)
            .Include(x => x.ChiTietDonThuocs)
            .Where(x => x.TrangThai == TrangThaiDonThuoc.DA_DUYET);

        var total = await query.CountAsync();
        var rawData = await query.OrderBy(x => x.NgayKe)
            .Skip((Math.Max(1, pageIndex) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync();

        var data = rawData.Select(x =>
        {
            var activeInvoice = x.LuotKham.HoaDons.FirstOrDefault(h => h.TrangThai != TrangThaiHoaDon.DA_HUY);
            var isPaid = activeInvoice != null && (activeInvoice.TrangThai == TrangThaiHoaDon.DA_THANH_TOAN || (activeInvoice.TongTien > 0 && activeInvoice.DaThanhToan >= activeInvoice.TongTien));
            var canDispense = !settings.RequirePaymentBeforeDispense || isPaid;

            return new
            {
                prescriptionId = x.Id,
                prescriptionCode = $"DT-{x.NgayKe.Year}-{x.Id:D5}",
                maLuotKham = x.MaLuotKham,
                patientName = (x.LuotKham.BenhNhan.Ho + " " + x.LuotKham.BenhNhan.Ten).Trim(),
                patientCode = $"BN-{x.LuotKham.BenhNhan.Id:D5}",
                doctorName = x.BacSi.HoTen,
                maBacSi = x.MaBacSi,
                ngayKe = x.NgayKe,
                trangThai = "CHO_CAP_PHAT",
                isPaid,
                canDispense,
                invoiceNumber = activeInvoice?.SoHoaDon,
                invoiceStatus = activeInvoice?.TrangThai.ToString(),
                invoiceAmount = activeInvoice?.TongTien,
                lineCount = x.ChiTietDonThuocs.Count,
                x.GhiChu
            };
        }).ToList();

        return InventoryResult.Ok(new { items = data, total });
    }

    public async Task<InventoryResult> PreviewFefo(int prescriptionId)
    {
        var prescription = await db.DonThuocs.AsNoTracking()
            .Include(x => x.ChiTietDonThuocs)
            .Include(x => x.LuotKham).ThenInclude(lk => lk.BenhNhan)
            .Include(x => x.LuotKham).ThenInclude(lk => lk.HoaDons)
            .Include(x => x.BacSi)
            .FirstOrDefaultAsync(x => x.Id == prescriptionId);

        if (prescription is null) return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);

        var activeInvoice = prescription.LuotKham?.HoaDons
            .FirstOrDefault(h => h.TrangThai != TrangThaiHoaDon.DA_HUY);
        var isPaid = activeInvoice != null && (activeInvoice.TrangThai == TrangThaiHoaDon.DA_THANH_TOAN || (activeInvoice.TongTien > 0 && activeInvoice.DaThanhToan >= activeInvoice.TongTien));
        var canDispense = !settings.RequirePaymentBeforeDispense || isPaid;

        var itemsPreview = new List<object>();
        bool allAvailable = true;

        foreach (var line in prescription.ChiTietDonThuocs)
        {
            var item = await db.Items.AsNoTracking().FirstOrDefaultAsync(x => x.Id == line.MaItem && x.IsActive);
            if (item is null) continue;

            var need = line.RemainingQuantity();
            var batches = await db.TonKhos.AsNoTracking()
                .Include(x => x.ChiTietNhapKho)
                .Where(x => x.MaKho == DefaultWarehouseId &&
                            x.MaItem == line.MaItem &&
                            x.SoLuongTon > 0 &&
                            (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(x => x.ChiTietNhapKho.HanSuDung)
                .ToListAsync();

            var totalStock = batches.Sum(x => x.SoLuongTon);
            if (totalStock < need) allAvailable = false;

            var allocations = new List<object>();
            var remainingNeed = need;

            foreach (var batch in batches)
            {
                if (remainingNeed <= 0) break;
                var take = Math.Min(remainingNeed, batch.SoLuongTon);
                allocations.Add(new
                {
                    stockId = batch.Id,
                    batchNumber = batch.ChiTietNhapKho.SoLo,
                    expiryDate = batch.ChiTietNhapKho.HanSuDung,
                    quantityToTake = take,
                    availableBefore = batch.SoLuongTon,
                    availableAfter = batch.SoLuongTon - take
                });
                remainingNeed -= take;
            }

            itemsPreview.Add(new
            {
                itemId = item.Id,
                itemCode = item.Ma,
                itemName = item.Ten,
                baseUnit = item.DonViTinhCoBan,
                prescribedQuantity = line.SoLuongKe,
                dispensedQuantity = line.SoLuongDaXuat,
                remainingQuantity = need,
                totalAvailableStock = totalStock,
                isSufficient = totalStock >= need,
                allocations
            });
        }

        return InventoryResult.Ok(new
        {
            prescriptionId = prescription.Id,
            prescriptionCode = $"DT-{prescription.NgayKe.Year}-{prescription.Id:D5}",
            patientName = (prescription.LuotKham?.BenhNhan.Ho + " " + prescription.LuotKham?.BenhNhan.Ten).Trim(),
            patientCode = prescription.LuotKham?.BenhNhan != null ? $"BN-{prescription.LuotKham.BenhNhan.Id:D5}" : string.Empty,
            doctorName = prescription.BacSi?.HoTen ?? string.Empty,
            isPaid,
            canDispense,
            invoiceNumber = activeInvoice?.SoHoaDon,
            requirePayment = settings.RequirePaymentBeforeDispense,
            allAvailable,
            items = itemsPreview
        });
    }

    public async Task<InventoryResult> DispensedPrescriptions(
        string? keyword,
        DateTime? fromDate,
        DateTime? toDate,
        int pageIndex = 1,
        int pageSize = 20)
    {
        pageIndex  = Math.Max(1, pageIndex);
        pageSize   = Math.Clamp(pageSize, 1, 100);
        keyword    = keyword?.Trim();

        var query = db.DonThuocs
            .AsNoTracking()
            .Where(x => x.TrangThai == TrangThaiDonThuoc.DA_XUAT_HET);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            query = query.Where(x =>
                x.LuotKham.BenhNhan.Ho.Contains(keyword) ||
                x.LuotKham.BenhNhan.Ten.Contains(keyword) ||
                x.BacSi.HoTen.Contains(keyword) ||
                (x.NguoiCapThuoc != null && x.NguoiCapThuoc.HoTen.Contains(keyword)));
        }

        if (fromDate.HasValue)
        {
            var from = fromDate.Value.Date;
            query = query.Where(x => x.NgayCapThuoc.HasValue && x.NgayCapThuoc.Value >= from);
        }

        if (toDate.HasValue)
        {
            var exclusiveEnd = toDate.Value.Date.AddDays(1);
            query = query.Where(x => x.NgayCapThuoc.HasValue && x.NgayCapThuoc.Value < exclusiveEnd);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.NgayCapThuoc)
            .ThenByDescending(x => x.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                prescriptionId   = x.Id,
                prescriptionCode = $"DT-{x.NgayKe.Year}-{x.Id:D5}",
                maLuotKham       = x.MaLuotKham,
                patientName      = (x.LuotKham.BenhNhan.Ho + " " + x.LuotKham.BenhNhan.Ten).Trim(),
                doctorName       = x.BacSi.HoTen,
                dispenserName    = x.NguoiCapThuoc != null ? x.NguoiCapThuoc.HoTen : string.Empty,
                ngayKe           = x.NgayKe,
                ngayCapThuoc     = x.NgayCapThuoc,
                exportReceiptCode = db.PhieuXuatKhos
                    .Where(p => p.MaDonThuoc == x.Id && p.LoaiXuat == LoaiXuatKho.XUAT_DON)
                    .OrderByDescending(p => p.Id)
                    .Select(p => p.MaPhieu)
                    .FirstOrDefault(),
                soLuongDong = x.ChiTietDonThuocs.Count(),
                trangThai   = "DA_XUAT_HET",
            })
            .ToListAsync();

        return InventoryResult.Ok(new { items, total, pageIndex, pageSize });
    }

    public async Task<InventoryResult> Dispense(int prescriptionId, DispenseRequest request)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(Dispense));
        if (replay is not null) return replay;

        var prescription = await db.DonThuocs.Include(x => x.ChiTietDonThuocs).FirstOrDefaultAsync(x => x.Id == prescriptionId);
        if (prescription is null) return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);
        if (prescription.TrangThai != TrangThaiDonThuoc.DA_DUYET) return InventoryResult.Error("Đơn thuốc chưa sẵn sàng cấp phát.", 409);

        // Khép kín Viện phí & Quầy dược
        if (settings.RequirePaymentBeforeDispense)
        {
            var activeInvoice = await db.HoaDons.AsNoTracking()
                .Where(h => h.MaLuotKham == prescription.MaLuotKham && h.TrangThai != TrangThaiHoaDon.DA_HUY)
                .OrderByDescending(h => h.Id)
                .FirstOrDefaultAsync();

            var isPaid = activeInvoice != null && (activeInvoice.TrangThai == TrangThaiHoaDon.DA_THANH_TOAN || (activeInvoice.TongTien > 0 && activeInvoice.DaThanhToan >= activeInvoice.TongTien));
            if (!isPaid)
                return InventoryResult.Error("Đơn thuốc chưa được thanh toán viện phí tại quầy thu ngân.", 409);
        }

        const int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            await using var transaction = await db.BeginTransactionAsync();
            try
            {
                var allocations = new List<object>();
                var export = new PhieuXuatKho
                {
                    MaPhieu = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                    LoaiXuat = LoaiXuatKho.XUAT_DON,
                    MaKhoXuat = DefaultWarehouseId,
                    MaDonThuoc = prescriptionId,
                    MaNguoiXuat = UserId,
                    GhiChu = request.Note ?? string.Empty
                };

                foreach (var line in prescription.ChiTietDonThuocs)
                {
                    var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.MaItem && x.IsActive);
                    if (item is null) return InventoryResult.Error($"Mặt hàng {line.MaItem} không tồn tại.", 404);
                    var need = line.RemainingQuantity();
                    if (need <= 0) continue;

                    var batches = await db.TonKhos.Include(x => x.ChiTietNhapKho)
                        .Where(x => x.MaKho == DefaultWarehouseId &&
                                    x.MaItem == line.MaItem &&
                                    x.SoLuongTon > 0 &&
                                    (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                        .OrderBy(x => x.ChiTietNhapKho.HanSuDung)
                        .ToListAsync();

                    if (batches.Sum(x => x.SoLuongTon) < need)
                        return InventoryResult.Error($"Không đủ tồn kho cho thuốc {item.Ma} ({item.Ten}).", 409);

                    var lineAllocations = new List<object>();
                    foreach (var batch in batches)
                    {
                        var quantity = Math.Min(need, batch.SoLuongTon);
                        var before = batch.SoLuongTon;
                        try { batch.SubtractQuantity(quantity); }
                        catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }

                        export.ChiTietXuatKhos.Add(new ChiTietXuatKho
                        {
                            ChiTietNhapKho = batch.ChiTietNhapKho,
                            SoLuongXuat = quantity,
                            DonGiaXuat = line.DonGiaKe
                        });

                        db.Add(new InventoryTransaction
                        {
                            LoaiGiaoDich = LoaiGiaoDichKho.XUAT_DON,
                            MaItem = line.MaItem,
                            MaTonKho = batch.Id,
                            SoLo = batch.ChiTietNhapKho.SoLo,
                            SoLuongTruoc = before,
                            SoLuongThayDoi = -quantity,
                            SoLuongSau = batch.SoLuongTon,
                            MaChungTu = export.MaPhieu,
                            MaNguoiThucHien = UserId,
                            IdempotencyKey = request.IdempotencyKey
                        });

                        line.UpdateDispensedQuantity(quantity);
                        lineAllocations.Add(new { batchNumber = batch.ChiTietNhapKho.SoLo, quantity });
                        need -= quantity;
                        if (need == 0) break;
                    }
                    allocations.Add(new { itemId = line.MaItem, itemName = item.Ten, quantity = line.SoLuongDaXuat, allocations = lineAllocations });
                }

                prescription.CompleteDispense(UserId);
                db.Add(export);
                await db.SaveChangesAsync();

                var printData = await PrescriptionPrintData(prescriptionId);
                if (!printData.IsSuccess) return printData;

                var result = new
                {
                    prescriptionId,
                    exportReceiptId = export.Id,
                    prescriptionStatus = "DA_XUAT_HET",
                    dispensedItems = allocations,
                    printData = printData.Data
                };

                await SaveReplayAsync(request.IdempotencyKey, nameof(Dispense), result);
                await transaction.CommitAsync();
                return InventoryResult.Ok(result);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (attempt == maxRetries)
                    return InventoryResult.Error("Tồn kho đang có biến động từ giao dịch đồng thời, vui lòng thử lại.", 409);
                await Task.Delay(50 * attempt);
            }
        }

        return InventoryResult.Error("Không thể hoàn tất cấp phát do xung đột tồn kho.", 409);
    }

    public async Task<InventoryResult> PrescriptionPrintData(int prescriptionId)
        {
           if (prescriptionId <= 0)
               return InventoryResult.Error("Mã đơn thuốc không hợp lệ.");

           var prescription = await db.DonThuocs
               .AsNoTracking()
               .Include(x => x.LuotKham)
                   .ThenInclude(x => x.BenhNhan)
               .Include(x => x.LuotKham)
                   .ThenInclude(x => x.ChanDoans)
               .Include(x => x.BacSi)
               .Include(x => x.CoSo)
               .Include(x => x.NguoiCapThuoc)
               .Include(x => x.ChiTietDonThuocs)
                   .ThenInclude(x => x.Item)
               .FirstOrDefaultAsync(x => x.Id == prescriptionId);

           if (prescription is null)
               return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);

           if (prescription.TrangThai != TrangThaiDonThuoc.DA_XUAT_HET ||
               !prescription.NgayCapThuoc.HasValue ||
               !prescription.MaNguoiCapThuoc.HasValue)
           {
               return InventoryResult.Error("Đơn thuốc chưa hoàn tất cấp phát.", 409);
           }

           var export = await db.PhieuXuatKhos
               .AsNoTracking()
               .Include(x => x.KhoXuat)
               .Include(x => x.NguoiXuat)
               .Include(x => x.ChiTietXuatKhos)
                   .ThenInclude(x => x.ChiTietNhapKho)
                       .ThenInclude(x => x.Item)
               .Where(x => x.MaDonThuoc == prescriptionId && x.LoaiXuat == LoaiXuatKho.XUAT_DON)
               .OrderByDescending(x => x.NgayXuat)
               .ThenByDescending(x => x.Id)
               .FirstOrDefaultAsync();

           if (export is null || export.ChiTietXuatKhos.Count == 0)
               return InventoryResult.Error("Không tìm thấy phiếu xuất cấp phát của đơn thuốc.", 409);

           var printData = MapPrescriptionPrintData(prescription, export);
           return InventoryResult.Ok(printData);
        }

        private static PrescriptionPrintDto MapPrescriptionPrintData(
           DonThuoc prescription,
           PhieuXuatKho export)
        {
           var patient = prescription.LuotKham.BenhNhan;
           var diagnosis = prescription.LuotKham.ChanDoans
               .OrderByDescending(x => x.LaChanDoanChinh)
               .ThenBy(x => x.Id)
               .FirstOrDefault();

           var items = prescription.ChiTietDonThuocs
               .OrderBy(x => x.Id)
               .Select((line, index) =>
               {
                   var batches = export.ChiTietXuatKhos
                       .Where(x => x.ChiTietNhapKho.MaItem == line.MaItem)
                       .OrderBy(x => x.Id)
                       .Select(x => new PrescriptionPrintBatchDto(
                           x.ChiTietNhapKho.SoLo,
                           x.ChiTietNhapKho.HanSuDung,
                           x.SoLuongXuat))
                       .ToList();

                   return new PrescriptionPrintItemDto(
                       index + 1,
                       line.Item.Ma,
                       line.Item.Ten,
                       line.Item.DangBaoChe,
                       line.SoLuongDaXuat,
                       VietnameseQuantity(line.SoLuongDaXuat),
                       line.Item.DonViTinhCoBan,
                       batches,
                       BuildUsageInstruction(line.LieuDung, line.TanSuat, line.SoNgay, line.HuongDan));
               })
               .ToList();

           var facility = prescription.CoSo;
           var dispenser = prescription.NguoiCapThuoc ?? export.NguoiXuat;

           return new PrescriptionPrintDto(
               new PrescriptionPrintHeaderDto(
                   "SỞ Y TẾ TP. HỒ CHÍ MINH",
                   new PrescriptionPrintFacilityDto(facility.Ten, facility.DiaChi, facility.DienThoai),
                   $"DT-{prescription.NgayKe.Year}-{prescription.Id:D5}",
                   $"LK-{prescription.MaLuotKham:D3}",
                   $"BN-{patient.Id:D5}",
                   "ĐƠN THUỐC",
                   "Kèm thông tin xuất kho cấp phát"),
               new PrescriptionPrintPatientDto(
                   $"{patient.Ho} {patient.Ten}".Trim(),
                   CalculateAge(patient.NgaySinh, prescription.NgayKe),
                   PatientGender(patient.GioiTinh),
                   patient.SoCCCD,
                   patient.DienThoai,
                   patient.DiaChi),
               new PrescriptionPrintDiagnosisDto(
                   diagnosis?.MaICD ?? string.Empty,
                   diagnosis?.TenChanDoan ?? string.Empty),
               items,
               PrescriptionNotes(prescription.GhiChu),
               new PrescriptionPrintConfirmationDto(
                   prescription.NgayKe,
                   new PrescriptionPrintDoctorDto(prescription.BacSi.HoTen, prescription.BacSi.SoHanhNghe),
                   new PrescriptionPrintDispenserDto(
                       dispenser.HoTen,
                       "ĐÃ CẤP PHÁT")),
               new[]
               {
                   "Khám lại xin mang theo đơn này.",
                   "Thuốc đã xuất khỏi quầy xin vui lòng kiểm tra kỹ trước khi rời đi."
               });
        }

        private static string BuildUsageInstruction(
           string lieuDung,
           string tanSuat,
           int? soNgay,
           string huongDan)
        {
           var parts = new[] { lieuDung, tanSuat, soNgay.HasValue ? $"{soNgay} ngày" : string.Empty, huongDan }
               .Where(x => !string.IsNullOrWhiteSpace(x))
               .Select(x => x.Trim());
           return string.Join(", ", parts);
        }

        private static IReadOnlyList<string> PrescriptionNotes(string note)
           => string.IsNullOrWhiteSpace(note)
               ? Array.Empty<string>()
               : note.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries)
                   .Select(x => x.Trim())
                   .Where(x => x.Length > 0)
                   .ToArray();

        private static int CalculateAge(DateTime dateOfBirth, DateTime referenceDate)
        {
           var age = referenceDate.Year - dateOfBirth.Year;
           if (referenceDate.Date < dateOfBirth.Date.AddYears(age))
               age--;
           return Math.Max(0, age);
        }

        private static string PatientGender(ClinicManagement.Domain.Common.Enums.GioiTinh gender)
           => gender switch
           {
               ClinicManagement.Domain.Common.Enums.GioiTinh.M => "Nam",
               ClinicManagement.Domain.Common.Enums.GioiTinh.F => "Nữ",
               _ => "Khác"
           };

        private static string VietnameseQuantity(decimal quantity)
           => quantity == decimal.Truncate(quantity)
               ? VietnameseInteger((long)quantity)
               : quantity.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture);

        private static string VietnameseInteger(long value)
           => value switch
           {
               0 => "Không",
               1 => "Một",
               2 => "Hai",
               3 => "Ba",
               4 => "Bốn",
               5 => "Năm",
               6 => "Sáu",
               7 => "Bảy",
               8 => "Tám",
               9 => "Chín",
               10 => "Mười",
               _ => value.ToString(System.Globalization.CultureInfo.InvariantCulture)
           };


}
