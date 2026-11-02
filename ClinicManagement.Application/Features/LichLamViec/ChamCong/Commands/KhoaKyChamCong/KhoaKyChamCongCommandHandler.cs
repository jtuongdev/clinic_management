using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class KhoaKyChamCongCommandHandler : IRequestHandler<KhoaKyChamCongCommand, AttendancePeriodDto>
{
    private readonly IChamCongRepository repository;
    public KhoaKyChamCongCommandHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<AttendancePeriodDto> Handle(KhoaKyChamCongCommand c, CancellationToken ct)
    {
        var x = await repository.GetPeriodAsync(c.Id, ct) ?? throw new KeyNotFoundException("Không tìm thấy kỳ chấm công.");
        if (c.Lock)
            x.Lock(c.UserId);
        else
            x.Unlock();

        repository.UpdatePeriod(x);
        await repository.AddAuditAsync("KyChamCong", x.Id, c.Lock ? "LOCK" : "UNLOCK", "", x.DaKhoa.ToString(), c.UserId, ct);
        await repository.UnitOfWork.SaveChangesAsync(ct);
        return AnhXaChamCong.ToDto(x);
    }
}
