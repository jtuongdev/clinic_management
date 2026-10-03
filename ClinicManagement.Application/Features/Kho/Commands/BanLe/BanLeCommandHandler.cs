using ClinicManagement.Application.Common.Interfaces;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed class BanLeCommandHandler
    : IRequestHandler<BanLeCommand, InventoryResult>
{
    public Task<InventoryResult> Handle(BanLeCommand request, CancellationToken ct)
        => Task.FromResult(InventoryResult.Error(
            "Chức năng bán lẻ thuốc vãng lai đã ngừng hỗ trợ. Chỉ cấp thuốc theo đơn khám.", 400));
}
