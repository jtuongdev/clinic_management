using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public abstract record KhoRequest(int UserId) : IRequest<InventoryResult>;

public abstract class KhoHandler<T>(IKhoService Operations) : IRequestHandler<T, InventoryResult> where T : KhoRequest
{
    protected void Set(T request) => Operations.SetUserId(request.UserId);
    protected IKhoService Ops => Operations;
    public abstract Task<InventoryResult> Handle(T request, CancellationToken cancellationToken);
}
