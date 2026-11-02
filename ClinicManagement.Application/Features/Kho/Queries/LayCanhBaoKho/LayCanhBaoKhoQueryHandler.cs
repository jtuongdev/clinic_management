using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class LayCanhBaoKhoQueryHandler(
    IKhoRepository db,
    IInventorySettings settings)
    : IRequestHandler<LayCanhBaoKhoQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayCanhBaoKhoQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var limit = now.AddDays(Math.Max(0, request.ExpiringWithinDays));
        var data = await db.TonKhos.AsNoTracking()
            .Where(s => s.MaKho == settings.DefaultWarehouseId && s.SoLuongTon > 0 && s.ChiTietNhapKho.HanSuDung.HasValue && s.ChiTietNhapKho.HanSuDung <= limit)
            .Select(s => new { stockId = s.Id, itemId = s.MaItem, itemCode = s.Item.Ma, itemName = s.Item.Ten, batchNumber = s.ChiTietNhapKho.SoLo, expiryDate = s.ChiTietNhapKho.HanSuDung, quantity = s.SoLuongTon })
            .ToListAsync(ct);
        return InventoryResult.Ok(data);
    }
}
