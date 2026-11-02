using ClinicManagement.Application.Common.Helpers;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Common.Notifications.Templates;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Inventory.Services;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class CapPhatDonCommandHandler(
    IKhoRepository db,
    IInventorySettings settings,
    FefoAllocationService fefo,
    IdempotencyHelper idempotency,
    IEmailSender emailSender,
    ILogger<CapPhatDonCommandHandler> logger)
    : IRequestHandler<CapPhatDonCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(CapPhatDonCommand request, CancellationToken ct)
    {
        var (prescriptionId, r, userId) = (request.PrescriptionId, request.Data, request.UserId);

        var replay = await idempotency.TryReplayAsync(r.IdempotencyKey, nameof(CapPhatDonCommand));
        if (replay is not null) return InventoryResult.Raw(replay.ResponseJson, replay.StatusCode);

        var prescription = await db.DonThuocs
            .Include(x => x.ChiTietDonThuocs)
            .FirstOrDefaultAsync(x => x.Id == prescriptionId, ct);
        if (prescription is null) return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);
        if (prescription.TrangThai != TrangThaiDonThuoc.DA_DUYET) return InventoryResult.Error("Đơn thuốc chưa sẵn sàng cấp phát.", 409);

        if (settings.RequirePaymentBeforeDispense)
        {
            var activeInvoice = await db.HoaDons
                .AsNoTracking()
                .Where(h => h.MaLuotKham == prescription.MaLuotKham && h.TrangThai != TrangThaiHoaDon.DA_HUY)
                .OrderByDescending(h => h.Id)
                .FirstOrDefaultAsync(ct);
            var isPaid = activeInvoice != null && (activeInvoice.TrangThai == TrangThaiHoaDon.DA_THANH_TOAN ||
                (activeInvoice.TongTien > 0 && activeInvoice.DaThanhToan >= activeInvoice.TongTien));
            if (!isPaid) return InventoryResult.Error("Đơn thuốc chưa được thanh toán viện phí tại quầy thu ngân.", 409);
        }

        const int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            await using var transaction = await db.BeginTransactionAsync(ct);
            try
            {
                var allocations = new List<object>();
                var export = new PhieuXuatKho
                {
                    MaPhieu = $"PX-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                    LoaiXuat = LoaiXuatKho.XUAT_DON,
                    MaKhoXuat = settings.DefaultWarehouseId,
                    MaDonThuoc = prescriptionId,
                    MaNguoiXuat = userId,
                    GhiChu = r.Note ?? string.Empty
                };

                foreach (var line in prescription.ChiTietDonThuocs)
                {
                    var item = await db.Items.FirstOrDefaultAsync(x => x.Id == line.MaItem && x.IsActive, ct);
                    if (item is null) return InventoryResult.Error($"Mặt hàng {line.MaItem} không tồn tại.", 404);
                    var need = line.RemainingQuantity();
                    if (need <= 0) continue;

                    var batches = await db.TonKhos.Include(x => x.ChiTietNhapKho)
                        .Where(x => x.MaKho == settings.DefaultWarehouseId && x.MaItem == line.MaItem && x.SoLuongTon > 0
                            && (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                        .OrderBy(x => x.ChiTietNhapKho.HanSuDung)
                        .ToListAsync(ct);

                    if (!FefoAllocationService.HasSufficientStock(batches, need))
                        return InventoryResult.Error($"Không đủ tồn kho cho thuốc {item.Ma} ({item.Ten}).", 409);

                    var lineAllocations = new List<object>();
                    foreach (var allocated in fefo.Allocate(batches, need))
                    {
                        export.ChiTietXuatKhos.Add(new ChiTietXuatKho
                        {
                            ChiTietNhapKho = allocated.Batch.ChiTietNhapKho,
                            SoLuongXuat = allocated.QuantityToTake,
                            DonGiaXuat = line.DonGiaKe
                        });
                        db.Add(new InventoryTransaction
                        {
                            LoaiGiaoDich = LoaiGiaoDichKho.XUAT_DON, MaItem = line.MaItem, MaTonKho = allocated.Batch.Id,
                            SoLo = allocated.Batch.ChiTietNhapKho.SoLo, SoLuongTruoc = allocated.QuantityBefore,
                            SoLuongThayDoi = -allocated.QuantityToTake, SoLuongSau = allocated.Batch.SoLuongTon,
                            MaChungTu = export.MaPhieu, MaNguoiThucHien = userId, IdempotencyKey = r.IdempotencyKey
                        });
                        line.UpdateDispensedQuantity(allocated.QuantityToTake);
                        lineAllocations.Add(new { batchNumber = allocated.Batch.ChiTietNhapKho.SoLo, quantity = allocated.QuantityToTake });
                    }
                    allocations.Add(new { itemId = line.MaItem, itemName = item.Ten, quantity = line.SoLuongDaXuat, allocations = lineAllocations });
                }

                prescription.CompleteDispense(userId);
                db.Add(export);
                await db.SaveChangesAsync(ct);

                var result = new
                {
                    prescriptionId,
                    exportReceiptId = export.Id,
                    prescriptionStatus = "DA_XUAT_HET",
                    dispensedItems = allocations
                };
                await idempotency.SaveAsync(r.IdempotencyKey, nameof(CapPhatDonCommand), result, userId);
                await transaction.CommitAsync(ct);

                // Gửi email đơn thuốc điện tử cho bệnh nhân nếu có địa chỉ email
                var patientEmail = prescription.LuotKham?.BenhNhan?.Email;
                if (!string.IsNullOrWhiteSpace(patientEmail))
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var emailData = new PrescriptionEmailData
                            {
                                MaDonThuoc = prescription.Id,
                                TenBenhNhan = $"{prescription.LuotKham.BenhNhan.Ho} {prescription.LuotKham.BenhNhan.Ten}".Trim(),
                                TenBacSi = prescription.BacSi?.HoTen ?? "Bác sĩ chỉ định",
                                NgayKeDon = prescription.NgayKe,
                                LoiDanBacSi = prescription.GhiChu,
                                Thuocs = prescription.ChiTietDonThuocs.Select(c => new PrescriptionDrugItemEmailDto
                                {
                                    TenThuoc = $"Mặt hàng #{c.MaItem}",
                                    SoLuong = c.SoLuongDaXuat > 0 ? c.SoLuongDaXuat : c.SoLuongKe,
                                    CachDung = string.IsNullOrWhiteSpace(c.HuongDan) ? $"{c.LieuDung} {c.TanSuat}".Trim() : c.HuongDan
                                }).ToList()
                            };

                            var emailNotification = new PrescriptionDispenseEmail(emailData);
                            await emailSender.SendEmailAsync(
                                patientEmail,
                                emailNotification.Subject,
                                emailNotification.BuildHtmlBody(),
                                cancellationToken: CancellationToken.None);
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "Lỗi khi gửi email đơn thuốc #{Id}", prescription.Id);
                        }
                    }, CancellationToken.None);
                }

                return InventoryResult.Ok(result);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (attempt == maxRetries)
                    return InventoryResult.Error("Tồn kho đang có biến động từ giao dịch đồng thời, vui lòng thử lại.", 409);
                await Task.Delay(50 * attempt, ct);
            }
        }
        return InventoryResult.Error("Không thể hoàn tất cấp phát do xung đột tồn kho.", 409);
    }
}
