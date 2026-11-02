using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class QuetVaoCommandHandler : IRequestHandler<QuetVaoCommand, ChamCongDto>
{
    private readonly IChamCongRepository repository;
    public QuetVaoCommandHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<ChamCongDto> Handle(QuetVaoCommand command, CancellationToken cancellationToken)
    {
        if (command.MaNhanVien <= 0)
            throw new ArgumentException("Mã nhân viên không hợp lệ.");

        var scanTime = DongHoChamCong.Normalize(command.ThoiGianQuet);
        if (await repository.IsPeriodLockedAsync(scanTime.Date, cancellationToken))
            throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");

        if (await repository.HasApprovedLeaveAsync(command.MaNhanVien, scanTime.Date, cancellationToken))
            throw new InvalidOperationException("Nhân viên có đơn nghỉ phép đã được duyệt trong ngày này.");

        if (await repository.GetOpenAttendanceAsync(command.MaNhanVien, scanTime, cancellationToken) is not null)
            throw new InvalidOperationException(
                "Nhân viên còn một ca chưa check-out. Vui lòng hoàn tất bằng check-out hoặc gửi yêu cầu điều chỉnh trước khi check-in ca mới.");

        var candidateSchedules = await repository.GetCandidateSchedulesAsync(command.MaNhanVien, scanTime, cancellationToken);
        if (candidateSchedules.Count == 0)
            throw new InvalidOperationException("Bạn không có lịch làm việc trong khung giờ này. Vui lòng liên hệ quản trị phòng khám.");

        var eligibleSchedules = candidateSchedules.Where(schedule =>
        {
            if (schedule.CaTruc == null) return false;
            var start = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianBatDau);
            var end = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianKetThuc);
            if (schedule.CaTruc.ThoiGianKetThuc <= schedule.CaTruc.ThoiGianBatDau)
                end = end.AddDays(1);

            var earlyAllowed = start.AddMinutes(-60);
            return scanTime >= earlyAllowed && scanTime <= end;
        }).ToList();

        if (eligibleSchedules.Count == 0)
        {
            var nextCandidate = candidateSchedules
                .Where(s => s.CaTruc != null)
                .OrderBy(s => s.NgayLam.Date.Add(s.CaTruc!.ThoiGianBatDau))
                .FirstOrDefault();

            if (nextCandidate != null && nextCandidate.CaTruc != null)
            {
                var nStart = nextCandidate.NgayLam.Date.Add(nextCandidate.CaTruc.ThoiGianBatDau);
                var nEarly = nStart.AddMinutes(-60);
                if (scanTime < nEarly)
                {
                    throw new InvalidOperationException($"Chưa đến khung giờ check-in cho ca '{nextCandidate.CaTruc.TenCa}'. Bạn chỉ có thể check-in từ {nEarly:HH:mm} (trước ca tối đa 60 phút).");
                }
            }

            throw new InvalidOperationException("Bạn không có lịch làm việc trong khung giờ này. Vui lòng liên hệ quản trị phòng khám.");
        }

        Domain.Identity.LichLamViec matchedSchedule;
        if (command.MaLichLamViec.HasValue && command.MaLichLamViec.Value > 0)
        {
            var target = eligibleSchedules.FirstOrDefault(s => s.Id == command.MaLichLamViec.Value);
            matchedSchedule = target ?? eligibleSchedules
                .OrderBy(s => Math.Abs((scanTime - s.NgayLam.Date.Add(s.CaTruc!.ThoiGianBatDau)).TotalMinutes))
                .First();
        }
        else
        {
            matchedSchedule = eligibleSchedules
                .OrderBy(s => Math.Abs((scanTime - s.NgayLam.Date.Add(s.CaTruc!.ThoiGianBatDau)).TotalMinutes))
                .First();
        }

        var scheduledStart = matchedSchedule.NgayLam.Date.Add(matchedSchedule.CaTruc!.ThoiGianBatDau);
        var scheduledEnd = matchedSchedule.NgayLam.Date.Add(matchedSchedule.CaTruc.ThoiGianKetThuc);
        if (matchedSchedule.CaTruc.ThoiGianKetThuc <= matchedSchedule.CaTruc.ThoiGianBatDau)
            scheduledEnd = scheduledEnd.AddDays(1);

        var existing = await repository.GetByScheduleIdAsync(matchedSchedule.Id, cancellationToken);
        if (existing != null && existing.CheckIn.HasValue)
            throw new InvalidOperationException($"Ca '{matchedSchedule.CaTruc.TenCa}' ({scheduledStart:HH:mm} - {scheduledEnd:HH:mm}) đã được check-in lúc {existing.CheckIn:HH:mm:ss}.");

        var attendance = existing ?? new ChamCong
        {
            MaNhanVien = matchedSchedule.MaNhanVien,
            MaLichLamViec = matchedSchedule.Id,
            NgayChamCong = matchedSchedule.NgayLam.Date,
        };

        attendance.CheckInAt(scanTime, scheduledStart);
        if (!string.IsNullOrWhiteSpace(command.GhiChu))
            attendance.GhiChu = command.GhiChu.Trim();

        if (existing == null)
            await repository.AddAsync(attendance, cancellationToken);
        else
            repository.Update(attendance);

        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        var reloaded = await repository.GetByIdAsync(attendance.Id, cancellationToken) ?? attendance;
        return AnhXaChamCong.ToDto(reloaded);
    }
}
