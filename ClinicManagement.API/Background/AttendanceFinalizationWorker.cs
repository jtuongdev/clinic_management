using ClinicManagement.Application.Features.LichLamViec;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.API.Background;

public sealed class AttendanceFinalizationWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<AttendanceFinalizationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(15));

        do
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var repository = scope.ServiceProvider.GetRequiredService<IChamCongRepository>();
                var count = await repository.FinalizeAbsentAsync(DongHoChamCong.Now(), stoppingToken);
                if (count > 0)
                {
                    await repository.UnitOfWork.SaveChangesAsync(stoppingToken);
                    logger.LogInformation("Đã tự động chốt {Count} ca vắng mặt.", count);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Không thể tự động chốt ca vắng mặt.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
