using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Commands.TaoNhaCungCap;

public sealed class TaoNhaCungCapCommandHandler(
    IKhoRepository db)
    : IRequestHandler<TaoNhaCungCapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(TaoNhaCungCapCommand request, CancellationToken ct)
    {
        var p = request.Payload;
        var ma = p.Ma.Trim();
        var ten = p.Ten.Trim();
        if (string.IsNullOrWhiteSpace(ma) || string.IsNullOrWhiteSpace(ten))
            return InventoryResult.Error("Mã và tên nhà cung cấp không được để trống.");

        if (await db.NhaCungCaps.AnyAsync(x => x.Ma == ma && !x.IsDeleted, ct))
            return InventoryResult.Error("Mã nhà cung cấp đã tồn tại");

        var entity = new NhaCungCap
        {
            Ma = ma,
            Ten = ten,
            DiaChi = p.DiaChi ?? "",
            DienThoai = p.DienThoai ?? "",
            Email = p.Email ?? "",
            MaSoThue = p.MaSoThue ?? "",
            TrangThai = TrangThaiNhaCungCap.HoatDong
        };

        db.Add(entity);
        await db.SaveEntitiesAsync(ct);
        return InventoryResult.Ok(new { entity.Id });
    }
}
