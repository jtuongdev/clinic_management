using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class DoiTrangThaiMatHangCommandHandler(
    IKhoRepository db)
    : IRequestHandler<DoiTrangThaiMatHangCommand, InventoryResult>
{
    public async Task<InventoryResult> Handle(DoiTrangThaiMatHangCommand request, CancellationToken ct)
    {
        var item = await db.Items.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
        if (item is null) return InventoryResult.Error("Không tìm thấy mặt hàng.", 404);
        item.IsActive = !item.IsActive;
        await db.SaveChangesAsync(ct);
        return InventoryResult.Ok(new { id = request.Id, isActive = item.IsActive });
    }
}
