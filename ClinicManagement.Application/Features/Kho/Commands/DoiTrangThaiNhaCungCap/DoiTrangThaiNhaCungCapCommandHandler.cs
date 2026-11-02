using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Commands.DoiTrangThaiNhaCungCap;

public sealed class DoiTrangThaiNhaCungCapCommandHandler(
    IKhoRepository db)
    : IRequestHandler<DoiTrangThaiNhaCungCapCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(DoiTrangThaiNhaCungCapCommand request, CancellationToken ct)
    {
        var entity = await db.NhaCungCaps.FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, ct);
        if (entity is null) return InventoryResult.Error("Không tìm thấy nhà cung cấp", 404);

        entity.TrangThai = entity.TrangThai == TrangThaiNhaCungCap.HoatDong
            ? TrangThaiNhaCungCap.NgungHopTac
            : TrangThaiNhaCungCap.HoatDong;

        await db.SaveEntitiesAsync(ct);
        return InventoryResult.Ok(new { entity.Id, entity.TrangThai });
    }
}
