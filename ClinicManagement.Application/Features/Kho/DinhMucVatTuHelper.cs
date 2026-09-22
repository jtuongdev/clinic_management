using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Service;

namespace ClinicManagement.Application.Features.Kho
{
    public static class DinhMucVatTuHelper
    {
        /// <summary>
        /// Chuẩn hoá đơn vị tính và quy đổi số lượng định mức sang Đơn vị tính cơ bản của Item trong kho.
        /// </summary>
        public static decimal ConvertBomQuantityToBaseUnit(Item item, decimal bomQuantity, string? bomUnit)
        {
            if (bomQuantity <= 0) return 0;

            var baseUnit = (item.DonViTinhCoBan ?? string.Empty).Trim().ToLowerInvariant();
            var fromUnit = (bomUnit ?? string.Empty).Trim().ToLowerInvariant();

            // 1. Đơn vị đã trùng khớp với đơn vị cơ bản
            if (string.IsNullOrEmpty(fromUnit) || fromUnit == baseUnit)
            {
                return bomQuantity;
            }

            // 2. Tra cứu trong bảng quy đổi DonViTinhQuyDoi của Item (nếu đã cấu hình)
            if (item.DonViTinhQuyDois != null && item.DonViTinhQuyDois.Count > 0)
            {
                var match = item.DonViTinhQuyDois
                    .FirstOrDefault(x => x.DonVi.Trim().ToLowerInvariant() == fromUnit);
                if (match != null && match.HeSo > 0)
                {
                    // 1 [fromUnit] = match.HeSo * [baseUnit]
                    return bomQuantity * match.HeSo;
                }

                // Nếu baseUnit là đơn vị lớn và bảng quy đổi lưu tỷ lệ đơn vị nhỏ
                var baseMatch = item.DonViTinhQuyDois
                    .FirstOrDefault(x => x.DonVi.Trim().ToLowerInvariant() == baseUnit);
                if (baseMatch != null && baseMatch.HeSo > 0)
                {
                    return bomQuantity / baseMatch.HeSo;
                }
            }

            // 3. Quy đổi thông minh theo chuẩn đơn vị y tế thông dụng
            var itemNameLower = (item.Ten ?? string.Empty).ToLowerInvariant();

            // Nhóm Thể tích (ml vs Lít / Can / Chai)
            if (fromUnit == "ml" || fromUnit == "mililit")
            {
                if (baseUnit == "lít" || baseUnit == "lit" || baseUnit == "l")
                    return bomQuantity / 1000m;
                if (baseUnit == "can" || itemNameLower.Contains("can 5") || itemNameLower.Contains("5 lít") || itemNameLower.Contains("5l"))
                    return bomQuantity / 5000m;
                if (itemNameLower.Contains("500ml") && (baseUnit == "chai" || baseUnit == "lọ"))
                    return bomQuantity / 500m;
                if (itemNameLower.Contains("100ml") && (baseUnit == "chai" || baseUnit == "lọ"))
                    return bomQuantity / 100m;
                if (itemNameLower.Contains("1 lít") || itemNameLower.Contains("1l"))
                    return bomQuantity / 1000m;
            }
            else if ((fromUnit == "lít" || fromUnit == "lit" || fromUnit == "l") && baseUnit == "ml")
            {
                return bomQuantity * 1000m;
            }

            // Nhóm Độ dài (Mét vs Cuộn giấy in nhiệt)
            if ((fromUnit == "mét" || fromUnit == "met" || fromUnit == "m") && (baseUnit == "cuộn" || baseUnit == "cuon"))
            {
                if (itemNameLower.Contains("20m") || itemNameLower.Contains("20 m"))
                    return bomQuantity / 20m;
                if (itemNameLower.Contains("30m") || itemNameLower.Contains("30 m"))
                    return bomQuantity / 30m;
                return bomQuantity / 20m; // mặc định cuộn giấy ECG 20m
            }

            // Nhóm Số lượng đóng gói (Đôi / Chiếc / Cái vs Hộp)
            if (fromUnit == "đôi" || fromUnit == "doi")
            {
                if (baseUnit == "chiếc" || baseUnit == "chiec" || baseUnit == "cái" || baseUnit == "cai")
                    return bomQuantity * 2m;
                if (baseUnit == "hộp" || baseUnit == "hop")
                {
                    if (itemNameLower.Contains("100")) return (bomQuantity * 2m) / 100m;
                    if (itemNameLower.Contains("50")) return bomQuantity / 50m;
                }
            }
            else if (fromUnit == "chiếc" || fromUnit == "chiec" || fromUnit == "cái" || fromUnit == "cai")
            {
                if (baseUnit == "đôi" || baseUnit == "doi")
                    return bomQuantity / 2m;
                if (baseUnit == "hộp" || baseUnit == "hop")
                {
                    if (itemNameLower.Contains("100")) return bomQuantity / 100m;
                    if (itemNameLower.Contains("50")) return bomQuantity / 50m;
                }
            }

            // Fallback an toàn: giữ nguyên nếu không có luật chuyển đổi cụ thể
            return bomQuantity;
        }

        /// <summary>
        /// Kiểm tra xem vật tư có thuộc nhóm lấy mẫu máu / thủ thuật chọc ven dùng chung trong 1 lượt khám hay không.
        /// </summary>
        public static bool IsSharedSamplingItem(string itemName, string? bomNote)
        {
            var text = $"{itemName} {bomNote}".ToLowerInvariant();
            return text.Contains("lấy máu") ||
                   text.Contains("chân không") ||
                   text.Contains("serum gel") ||
                   text.Contains("nắp vàng") ||
                   text.Contains("urgo") ||
                   text.Contains("băng dán") ||
                   text.Contains("băng dính") ||
                   text.Contains("sát khuẩn") ||
                   text.Contains("chọc ven") ||
                   text.Contains("tĩnh mạch") ||
                   text.Contains("dùng chung");
        }

        /// <summary>
        /// Khấu trừ vật tư tiêu hao tự động cho dịch vụ cận lâm sàng / thủ thuật,
        /// tích hợp chống trùng lặp theo lượt khám và chuẩn hoá đơn vị tính.
        /// </summary>
        public static async Task DeductSuppliesForServiceAsync(
            IKhoRepository khoRepository,
            ChiDinhDichVu serviceOrder,
            int userId,
            int defaultWarehouseId,
            ILogger? logger,
            CancellationToken cancellationToken)
        {
            if (khoRepository == null || serviceOrder == null) return;

            try
            {
                // 1. Lấy danh sách định mức vật tư của dịch vụ
                var boms = await khoRepository.DinhMucVatTuDichVus
                    .Where(x => x.MaDanhMucDichVu == serviceOrder.MaDanhMuc && !x.IsDeleted)
                    .ToListAsync(cancellationToken);

                if (boms.Count == 0) return;

                // 2. Chống trừ trùng lặp cho chính chỉ định dịch vụ này (Idempotency)
                var referenceCode = $"DV-{serviceOrder.Id}";
                var alreadyDeducted = await khoRepository.InventoryTransactions
                    .AnyAsync(x => x.MaChungTu == referenceCode, cancellationToken);

                if (alreadyDeducted)
                {
                    logger?.LogInformation("[BOM] Dịch vụ #{ServiceId} đã được xuất hao phí vật tư trước đó, bỏ qua.", serviceOrder.Id);
                    return;
                }

                // 3. Khắc phục rủi ro nhân đôi/nhân ba vật tư lấy mẫu trong cùng lượt khám:
                // Tìm các dịch vụ khác trong cùng MaLuotKham đã từng xuất kho vật tư
                var siblingServiceOrderIds = await khoRepository.LuotKhams
                    .Where(x => x.Id == serviceOrder.MaLuotKham)
                    .SelectMany(x => x.ChiDinhDichVus)
                    .Where(x => x.Id != serviceOrder.Id && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync(cancellationToken);

                var previouslyDeductedItemIdsInVisit = new HashSet<int>();
                if (siblingServiceOrderIds.Count > 0)
                {
                    var siblingRefCodes = siblingServiceOrderIds.Select(id => $"DV-{id}").ToList();
                    var deductedItems = await khoRepository.InventoryTransactions
                        .Where(x => siblingRefCodes.Contains(x.MaChungTu))
                        .Select(x => x.MaItem)
                        .Distinct()
                        .ToListAsync(cancellationToken);

                    foreach (var itemId in deductedItems)
                    {
                        previouslyDeductedItemIdsInVisit.Add(itemId);
                    }
                }

                // 4. Chuẩn bị phiếu xuất kho hao phí thủ thuật
                var warehouseId = defaultWarehouseId > 0 ? defaultWarehouseId : 1;
                var performerId = userId > 0 ? userId : serviceOrder.MaBacSiChiDinh;
                if (performerId <= 0) performerId = 1;

                var export = new PhieuXuatKho
                {
                    MaPhieu = $"PX-VT-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                    LoaiXuat = LoaiXuatKho.XUAT_THU_THUAT,
                    MaKhoXuat = warehouseId,
                    MaNguoiXuat = performerId,
                    GhiChu = $"Xuất nội bộ hao phí vật tư dịch vụ #{serviceOrder.Id}"
                };

                // 5. Duyệt từng dòng định mức và khấu trừ
                foreach (var bom in boms)
                {
                    // Lấy thông tin Item và bảng quy đổi đơn vị
                    var item = await khoRepository.Items
                        .Include(x => x.DonViTinhQuyDois)
                        .FirstOrDefaultAsync(x => x.Id == bom.MaItem, cancellationToken);

                    if (item == null) continue;

                    // Kiểm tra nếu là vật tư lấy máu dùng chung và đã được trừ trong lượt khám này
                    if (IsSharedSamplingItem(item.Ten, bom.GhiChu) && previouslyDeductedItemIdsInVisit.Contains(bom.MaItem))
                    {
                        logger?.LogInformation(
                            "[BOM] Bỏ qua xuất vật tư '{ItemName}' (Id: {ItemId}) cho dịch vụ #{ServiceId} vì đã được cấp ở dịch vụ xét nghiệm trước trong cùng lượt khám #{LuotKhamId}.",
                            item.Ten, item.Id, serviceOrder.Id, serviceOrder.MaLuotKham);
                        continue;
                    }

                    // Chuẩn hoá và quy đổi số lượng cần xuất về đơn vị tính cơ bản của Item
                    var need = ConvertBomQuantityToBaseUnit(item, bom.SoLuong, bom.DonViTinh);
                    if (need <= 0) continue;

                    // Tìm các lô tồn kho còn hạn sử dụng, sắp xếp FIFO theo hạn dùng
                    var batches = await khoRepository.TonKhos
                        .Include(x => x.ChiTietNhapKho)
                        .Where(x => x.MaKho == warehouseId &&
                                    x.MaItem == bom.MaItem &&
                                    x.SoLuongTon > 0 &&
                                    (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                        .OrderBy(x => x.ChiTietNhapKho.HanSuDung)
                        .ToListAsync(cancellationToken);

                    foreach (var batch in batches)
                    {
                        if (need <= 0) break;
                        var qty = Math.Min(need, batch.SoLuongTon);
                        var before = batch.SoLuongTon;
                        batch.SubtractQuantity(qty);

                        export.ChiTietXuatKhos.Add(new ChiTietXuatKho
                        {
                            ChiTietNhapKho = batch.ChiTietNhapKho,
                            MaChiTietNhap = batch.MaChiTietNhap,
                            SoLuongXuat = qty,
                            DonGiaXuat = 0
                        });

                        khoRepository.Add(new InventoryTransaction
                        {
                            LoaiGiaoDich = LoaiGiaoDichKho.XUAT_THU_THUAT,
                            MaItem = bom.MaItem,
                            MaTonKho = batch.Id,
                            SoLo = batch.ChiTietNhapKho.SoLo,
                            SoLuongTruoc = before,
                            SoLuongThayDoi = -qty,
                            SoLuongSau = batch.SoLuongTon,
                            MaChungTu = referenceCode,
                            MaNguoiThucHien = userId > 0 ? userId : 1,
                            GhiChu = $"Hao phí tự động dịch vụ #{serviceOrder.Id} ({bom.SoLuong} {bom.DonViTinh} -> {qty} {item.DonViTinhCoBan})"
                        });

                        need -= qty;
                    }
                }

                // 6. Lưu chứng từ xuất kho nếu có phát sinh chi tiết xuất
                if (export.ChiTietXuatKhos.Count > 0)
                {
                    khoRepository.Add(export);
                    await khoRepository.SaveChangesAsync(cancellationToken);
                    logger?.LogInformation("[BOM] Đã tạo phiếu xuất kho hao phí {MaPhieu} với {Count} mục vật tư cho dịch vụ #{ServiceId}.",
                        export.MaPhieu, export.ChiTietXuatKhos.Count, serviceOrder.Id);
                }
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex, "[BOM] Lỗi khi xử lý khấu trừ hao phí vật tư dịch vụ #{ServiceId}: {Message}", serviceOrder.Id, ex.Message);
            }
        }
    }
}
