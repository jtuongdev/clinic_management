using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class QuetRaCommandHandler : IRequestHandler<QuetRaCommand, ChamCongDto>
{
    private readonly IChamCongRepository repository;
    public QuetRaCommandHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<ChamCongDto> Handle(QuetRaCommand command, CancellationToken cancellationToken)
    {
        if (command.MaNhanVien <= 0)
            throw new ArgumentException("Mã nhân viên không hợp lệ.");

        var scanTime = DongHoChamCong.Normalize(command.ThoiGianQuet);
        var attendance = await repository.GetOpenAttendanceAsync(command.MaNhanVien, scanTime, cancellationToken)
            ?? throw new InvalidOperationException("Không tìm thấy ca làm việc đang chờ check-out.");

        if (await repository.IsPeriodLockedAsync(attendance.NgayChamCong, cancellationToken))
            throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");

        var schedule = attendance.LichLamViec ?? (attendance.MaLichLamViec.HasValue ? await repository.GetScheduleAsync(attendance.MaLichLamViec.Value, cancellationToken) : null)
            ?? throw new InvalidOperationException("Không tìm thấy thông tin ca trực của lịch làm việc.");

        if (schedule.CaTruc == null)
            throw new InvalidOperationException("Không tìm thấy cấu hình ca trực.");

        var scheduledEnd = attendance.NgayChamCong.Date.Add(schedule.CaTruc.ThoiGianKetThuc);
        if (schedule.CaTruc.ThoiGianKetThuc <= schedule.CaTruc.ThoiGianBatDau)
            scheduledEnd = scheduledEnd.AddDays(1);

        attendance.CheckOutAt(scanTime, scheduledEnd);
        if (!string.IsNullOrWhiteSpace(command.GhiChu))
        {
            attendance.GhiChu = string.IsNullOrWhiteSpace(attendance.GhiChu)
                ? command.GhiChu.Trim()
                : $"{attendance.GhiChu} | {command.GhiChu.Trim()}";
        }

        repository.Update(attendance);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        var reloaded = await repository.GetByIdAsync(attendance.Id, cancellationToken) ?? attendance;
        return AnhXaChamCong.ToDto(reloaded);
    }
}
