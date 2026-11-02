using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class TaoKyChamCongCommandHandler : IRequestHandler<TaoKyChamCongCommand, AttendancePeriodDto>
{
    private readonly IChamCongRepository repository;
    public TaoKyChamCongCommandHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<AttendancePeriodDto> Handle(TaoKyChamCongCommand c, CancellationToken ct)
    {
        var x = new KyChamCong
        {
            TuNgay = DongHoChamCong.Normalize(c.Request.TuNgay).Date,
            DenNgay = DongHoChamCong.Normalize(c.Request.DenNgay).Date,
            GhiChu = c.Request.GhiChu?.Trim() ?? ""
        };
        x.Lock(0);
        x.Unlock();
        await repository.AddPeriodAsync(x, ct);
        await repository.UnitOfWork.SaveChangesAsync(ct);
        return AnhXaChamCong.ToDto(x);
    }
}
