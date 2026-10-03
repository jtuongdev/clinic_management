using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class TaoMatHangCommandHandler(
    IKhoRepository db)
    : IRequestHandler<TaoMatHangCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TaoMatHangCommand request, CancellationToken ct)
    {
        var r = request.Data;
        if (r.SalePrice < 0 || r.MinimumStock < 0 || string.IsNullOrWhiteSpace(r.Code) ||
            string.IsNullOrWhiteSpace(r.BaseUnit))
            return InventoryResult.Error("Thông tin danh mục không hợp lệ.");

        if (await db.Items.AnyAsync(x => x.Ma == r.Code, ct))
            return InventoryResult.Error("Mã hàng đã tồn tại.", 409);

        var item = new Item
        {
            Ma = r.Code.Trim(),
            Ten = r.Name.Trim(),
            LoaiItem = r.ItemType,
            DonViTinhCoBan = r.BaseUnit.Trim(),
            DangBaoChe = r.DosageForm ?? string.Empty,
            HamLuong = r.Strength ?? string.Empty,
            GiaBanLe = r.SalePrice,
            TonToiThieu = r.MinimumStock,
            CanKeDon = r.CanPrescribe,
            IsActive = true
        };
        item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = item.DonViTinhCoBan, HeSo = 1, IsBase = true });

        foreach (var conversion in r.Conversions ?? [])
        {
            if (conversion.Factor <= 0 || string.IsNullOrWhiteSpace(conversion.Unit) ||
                conversion.Unit.Equals(item.DonViTinhCoBan, StringComparison.OrdinalIgnoreCase))
                return InventoryResult.Error("Đơn vị quy đổi không hợp lệ.");
            item.DonViTinhQuyDois.Add(new DonViTinhQuyDoi { Item = item, DonVi = conversion.Unit.Trim(), HeSo = conversion.Factor });
        }

        db.Add(item);
        await db.SaveChangesAsync(ct);
        return InventoryResult.Ok(new { id = item.Id });
    }
}
