using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Commands.CapNhatNhaCungCap;

public sealed class CapNhatNhaCungCapCommandHandler(
    IKhoRepository db)
    : IRequestHandler<CapNhatNhaCungCapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(CapNhatNhaCungCapCommand request, CancellationToken ct)
    {
        var (id, p) = (request.Id, request.Payload);
        var entity = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct);
        if (entity is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp", 404);

        var ma = p.Ma.Trim();
        var ten = p.Ten.Trim();
        if (string.IsNullOrWhiteSpace(ma) || string.IsNullOrWhiteSpace(ten))
            return InventoryResult.Error("Mã và tên nhà cung cấp không được để trống.");

        if (entity.Ma != ma && await db.NhaCungCaps.AnyAsync(x => x.Ma == ma && x.Id != id && !x.IsDeleted, ct))
            return InventoryResult.Error("Mã nhà cung cấp đã tồn tại");

        entity.Ma = ma;
        entity.Ten = ten;
        entity.DiaChi = p.DiaChi ?? "";
        entity.DienThoai = p.DienThoai ?? "";
        entity.Email = p.Email ?? "";
        entity.MaSoThue = p.MaSoThue ?? "";

        await db.SaveEntitiesAsync(ct);
        return InventoryResult.Ok(new { entity.Id });
    }
}
