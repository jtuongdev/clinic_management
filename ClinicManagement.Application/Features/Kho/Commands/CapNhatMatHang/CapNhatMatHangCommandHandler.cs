using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class CapNhatMatHangCommandHandler(
    IKhoRepository db)
    : IRequestHandler<CapNhatMatHangCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(CapNhatMatHangCommand request, CancellationToken ct)
    {
        var (id, r) = (request.Id, request.Data);
        var item = await db.Items.Include(x => x.DonViTinhQuyDois).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (item is null) return InventoryResult.Error("Không tìm thấy mặt hàng.", 404);

        var hasTransactions = await db.InventoryTransactions.AnyAsync(x => x.MaItem == id, ct);
        if (hasTransactions)
        {
            item.Ten = r.Name.Trim();
            item.DangBaoChe = r.DosageForm ?? string.Empty;
            item.HamLuong = r.Strength ?? string.Empty;
            item.GiaBanLe = r.SalePrice;
            item.TonToiThieu = r.MinimumStock;
            item.CanKeDon = r.CanPrescribe;
        }
        else
        {
            item.Ma = r.Code.Trim();
            item.Ten = r.Name.Trim();
            item.LoaiItem = r.ItemType;
            item.DonViTinhCoBan = r.BaseUnit.Trim();
            item.DangBaoChe = r.DosageForm ?? string.Empty;
            item.HamLuong = r.Strength ?? string.Empty;
            item.GiaBanLe = r.SalePrice;
            item.TonToiThieu = r.MinimumStock;
            item.CanKeDon = r.CanPrescribe;
            item.DonViTinhQuyDois.Clear();
            item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = item.DonViTinhCoBan, HeSo = 1, IsBase = true });
            foreach (var conversion in r.Conversions ?? [])
            {
                if (conversion.Factor <= 0 || string.IsNullOrWhiteSpace(conversion.Unit) ||
                    conversion.Unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase))
                    return InventoryResult.Error("Đơn vị quy đổi không hợp lệ.");
                item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = conversion.Unit.Trim(), HeSo = conversion.Factor });
            }
        }

        await db.SaveChangesAsync(ct);
        return InventoryResult.Ok(new { id, lockedFields = hasTransactions ? new[] { "baseUnit", "conversions", "code" } : [] });
    }
}
