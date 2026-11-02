using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayDonChoCapPhatQueryHandler(
    IKhoRepository db,
    IInventorySettings settings)
    : IRequestHandler<LayDonChoCapPhatQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayDonChoCapPhatQuery request, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, request.PageIndex);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = db.DonThuocs.AsNoTracking()
            .Include(x => x.LuotKham).ThenInclude(lk => lk.BenhNhan)
            .Include(x => x.LuotKham).ThenInclude(lk => lk.HoaDons)
            .Include(x => x.BacSi)
            .Include(x => x.ChiTietDonThuocs)
            .Where(x => x.TrangThai == TrangThaiDonThuoc.DA_DUYET);

        var total = await query.CountAsync(ct);
        var rawData = await query.OrderBy(x => x.NgayKe)
            .Skip((pageIndex - 1) * pageSize).Take(pageSize)
            .ToListAsync(ct);

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
}
