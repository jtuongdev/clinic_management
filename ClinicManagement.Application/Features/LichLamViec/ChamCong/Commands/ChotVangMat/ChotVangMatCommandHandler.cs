using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class ChotVangMatCommandHandler : IRequestHandler<ChotVangMatCommand, int>
{
    private readonly IChamCongRepository repository;
    public ChotVangMatCommandHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<int> Handle(ChotVangMatCommand request, CancellationToken cancellationToken)
    {
        var count = await repository.FinalizeAbsentAsync(request.Now ?? DongHoChamCong.Now(), cancellationToken);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return count;
    }
}
