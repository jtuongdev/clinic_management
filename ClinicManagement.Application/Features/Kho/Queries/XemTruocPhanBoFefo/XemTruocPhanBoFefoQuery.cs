using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record XemTruocPhanBoFefoQuery(int PrescriptionId, int UserId) : IRequest<InventoryResult>;

public sealed class XemTruocPhanBoFefoQueryHandler(
    IKhoRepository db,
    IInventorySettings settings)
    : IRequestHandler<XemTruocPhanBoFefoQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(XemTruocPhanBoFefoQuery request, CancellationToken ct)
    {
        var prescription = await db.DonThuocs.AsNoTracking()
            .Include(x => x.ChiTietDonThuocs)
            .Include(x => x.LuotKham).ThenInclude(lk => lk.BenhNhan)
            .Include(x => x.LuotKham).ThenInclude(lk => lk.HoaDons)
            .Include(x => x.BacSi)
            .FirstOrDefaultAsync(x => x.Id == request.PrescriptionId, ct);

        if (prescription is null) return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);

        var activeInvoice = prescription.LuotKham?.HoaDons.FirstOrDefault(h => h.TrangThai != TrangThaiHoaDon.DA_HUY);
        var isPaid = activeInvoice != null && (activeInvoice.TrangThai == TrangThaiHoaDon.DA_THANH_TOAN ||
            (activeInvoice.TongTien > 0 && activeInvoice.DaThanhToan >= activeInvoice.TongTien));
        var canDispense = !settings.RequirePaymentBeforeDispense || isPaid;

        var itemsPreview = new List<object>();
        bool allAvailable = true;

        foreach (var line in prescription.ChiTietDonThuocs)
        {
            var item = await db.Items.AsNoTracking().FirstOrDefaultAsync(x => x.Id == line.MaItem && x.IsActive, ct);
            if (item is null) continue;

            var need = line.RemainingQuantity();
            var batches = await db.TonKhos.AsNoTracking()
                .Include(x => x.ChiTietNhapKho)
                .Where(x => x.MaKho == settings.DefaultWarehouseId && x.MaItem == line.MaItem && x.SoLuongTon > 0
                    && (!x.ChiTietNhapKho.HanSuDung.HasValue || x.ChiTietNhapKho.HanSuDung.Value > DateTime.UtcNow))
                .OrderBy(x => x.ChiTietNhapKho.HanSuDung)
                .ToListAsync(ct);

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
}
