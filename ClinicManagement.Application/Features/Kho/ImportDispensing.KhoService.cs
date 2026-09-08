using System.Text.Json;
using ClinicManagement.Application.Common.Interfaces;
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

        public async Task<InventoryResult> Import(ImportRequest request)
    {
        var replay = await ReplayAsync(request.IdempotencyKey, nameof(Import));
        if (replay is not null) return replay;
        var supplier = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == request.SupplierId);
        if (supplier is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp.", 404);
        if (supplier.TrangThai != TrangThaiNhaCungCap.HoatDong) return InventoryResult.Error("Nhà cung cấp đã ngừng hợp tác.", 409);
        var items = request.Items.ToList();
        if (items.Count == 0) return InventoryResult.Error("Phiếu nhập phải có ít nhất một dòng.");
        await using var transaction = await db.BeginTransactionAsync();
        var receipt = new PhieuNhapKho { MaPhieu = $"PN-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            MaCoSo = 1, MaKho = DefaultWarehouseId, MaNhaCungCap = request.SupplierId,
            NgayNhap = request.ReceivedAt, MaNguoiNhap = UserId, GhiChu = request.Note ?? string.Empty,
            NhaCungCap = supplier };
        foreach (var line in items)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.ItemId && x.IsActive);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.ItemId} không tồn tại hoặc đã ngừng sử dụng.", 404);
            var quantity = await ToBaseQuantity(item, line.Quantity, line.Unit);
            if (quantity <= 0 || (item.LoaiItem == LoaiItem.THUOC && !line.ExpiryDate.HasValue))
                return InventoryResult.Error("Số lượng/hạn sử dụng không hợp lệ.");
            var detail = new ChiTietNhapKho { Item = item, SoLuong = quantity, DonGiaNhap = line.PurchasePrice,
                SoLo = line.BatchNumber.Trim(), HanSuDung = line.ExpiryDate };
            receipt.ChiTietNhapKhos.Add(detail);
            receipt.TongTien += quantity * line.PurchasePrice;
        }
        receipt.TrangThai = request.SaveDraft ? TrangThaiPhieuNhap.CHO_DUYET : TrangThaiPhieuNhap.DA_NHAP;
        db.Add(receipt);
        await db.SaveChangesAsync();
        if (!request.SaveDraft)
        {
            foreach (var detail in receipt.ChiTietNhapKhos)
            {
                var stock = new TonKho { MaKho = DefaultWarehouseId, MaItem = detail.MaItem, MaChiTietNhap = detail.Id,
                    SoLuongTon = detail.SoLuong, NgayCapNhatCuoi = DateTime.UtcNow };
                db.Add(stock);
                db.Add(new InventoryTransaction { LoaiGiaoDich = LoaiGiaoDichKho.NHAP,
                    MaItem = detail.MaItem, MaTonKho = stock.Id, SoLo = detail.SoLo, SoLuongThayDoi = detail.SoLuong,
                    SoLuongSau = detail.SoLuong, MaChungTu = receipt.MaPhieu, MaNguoiThucHien = UserId,
                    IdempotencyKey = request.IdempotencyKey });
            }
            await db.SaveChangesAsync();
        }
        var result = new { id = receipt.Id, referenceCode = receipt.MaPhieu, status = receipt.TrangThai.ToString() };
        await SaveReplayAsync(request.IdempotencyKey, nameof(Import), result);
        await transaction.CommitAsync();
        return InventoryResult.Ok(result);
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
            var stock = new TonKho { MaKho = receipt.MaKho, MaItem = detail.MaItem, MaChiTietNhap = detail.Id,
                SoLuongTon = detail.SoLuong, NgayCapNhatCuoi = DateTime.UtcNow };
            db.Add(stock);
            db.Add(new InventoryTransaction { LoaiGiaoDich = LoaiGiaoDichKho.NHAP,
                MaItem = detail.MaItem, MaTonKho = stock.Id, SoLo = detail.SoLo, SoLuongThayDoi = detail.SoLuong,
                SoLuongSau = detail.SoLuong, MaChungTu = receipt.MaPhieu, MaNguoiThucHien = UserId });
        }
        await db.SaveChangesAsync(); await transaction.CommitAsync();
        return InventoryResult.Ok(new { id, status = receipt.TrangThai.ToString() });
    }

        public async Task<InventoryResult> PendingPrescriptions(int pageIndex = 1, int pageSize = 20)
    {
        var query = db.DonThuocs.AsNoTracking().Where(x => x.TrangThai == TrangThaiDonThuoc.DA_DUYET);
        var total = await query.CountAsync();
        var data = await query.OrderBy(x => x.NgayKe).Skip((Math.Max(1, pageIndex) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100)).Select(x => new { prescriptionId = x.Id, x.MaLuotKham,
                x.MaBacSi, x.NgayKe, trangThai = "CHO_CAP_PHAT", x.GhiChu }).ToListAsync();
        return InventoryResult.Ok(new { items = data, total });
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
        var allocations = new List<object>();
        await using var transaction = await db.BeginTransactionAsync();
        var export = new PhieuXuatKho { MaPhieu = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}", LoaiXuat = LoaiXuatKho.XUAT_DON,
            MaKhoXuat = DefaultWarehouseId, MaDonThuoc = prescriptionId, MaNguoiXuat = UserId,
            GhiChu = request.Note ?? string.Empty };
        foreach (var line in prescription.ChiTietDonThuocs)
        {
            var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.MaItem && x.IsActive);
            if (item is null) return InventoryResult.Error($"Mặt hàng {line.MaItem} không tồn tại.", 404);
            var need = line.RemainingQuantity();
            if (need <= 0) continue;
            var batches = await db.TonKhos.Include(x => x.ChiTietNhapKho).Where(x => x.MaKho == DefaultWarehouseId &&
                x.MaItem == line.MaItem && x.SoLuongTon > 0 &&
                (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(x => x.ChiTietNhapKho.HanSuDung).ToListAsync();
            if (batches.Sum(x => x.SoLuongTon) < need) return InventoryResult.Error($"Không đủ tồn kho cho {item.Ma}.", 409);
            var lineAllocations = new List<object>();
            foreach (var batch in batches)
            {
                // Concurrency guard: snapshot version khi load, so sánh khi subtract
                // Nếu frontend truyền ExpectedVersion thì dùng giá trị đó, ngược lại dùng version hiện tại
                var snapshotVersion = batch.Version;
                var quantity = Math.Min(need, batch.SoLuongTon);
                var before = batch.SoLuongTon;
                try { batch.SubtractQuantity(quantity); }
                catch (InvalidOperationException ex) { return InventoryResult.Error(ex.Message, 409); }
                // Nếu Version sau subtract khác snapshotVersion + 1 → có thể bị cập nhật ngoài luồng
                // EF sẽ bắt DbUpdateConcurrencyException khi SaveChanges vì Version là ConcurrencyToken
                if (request.ExpectedVersion.HasValue && snapshotVersion != request.ExpectedVersion.Value)
                    return InventoryResult.Error("Dữ liệu tồn kho đã thay đổi, vui lòng tải lại.", 409);
                export.ChiTietXuatKhos.Add(new ChiTietXuatKho { ChiTietNhapKho = batch.ChiTietNhapKho,
                    SoLuongXuat = quantity, DonGiaXuat = line.DonGiaKe });
                db.Add(new InventoryTransaction { LoaiGiaoDich = LoaiGiaoDichKho.XUAT_DON,
                    MaItem = line.MaItem, MaTonKho = batch.Id, SoLo = batch.ChiTietNhapKho.SoLo,
                    SoLuongTruoc = before, SoLuongThayDoi = -quantity, SoLuongSau = batch.SoLuongTon,
                    MaChungTu = export.MaPhieu, MaNguoiThucHien = UserId, IdempotencyKey = request.IdempotencyKey });
                line.UpdateDispensedQuantity(quantity); lineAllocations.Add(new { batchNumber = batch.ChiTietNhapKho.SoLo, quantity });
                need -= quantity; if (need == 0) break;
            }
            allocations.Add(new { itemId = line.MaItem, itemName = item.Ten, quantity = line.SoLuongDaXuat, allocations = lineAllocations });
        }
        prescription.CompleteDispense(UserId);
        db.Add(export);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { return InventoryResult.Error("Tồn kho đã thay đổi trong lúc xử lý, vui lòng thử lại.", 409); }
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
