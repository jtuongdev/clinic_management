using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands;

public sealed class XoaMemNhanVienCommandHandler(
    INhanVienRepository employeeRepository,
    ILichLamViecRepository scheduleRepository,
    IChamCongRepository attendanceRepository,
    ITokenLamMoiRepository tokenRepository)
    : IRequestHandler<XoaMemNhanVienCommand, XoaMemNhanVienResult>
{
    public async Task<XoaMemNhanVienResult> Handle(
        XoaMemNhanVienCommand command,
        CancellationToken cancellationToken)
    {
        if (command.Id <= 0 || command.DeletedBy <= 0)
            throw new ArgumentException("Thông tin nhân viên hoặc người thực hiện không hợp lệ.");
        if (string.IsNullOrWhiteSpace(command.LyDo))
            throw new ArgumentException("Lý do nghỉ việc là bắt buộc.");

        var effectiveDate = command.NgayNghiViec.Date;
        var employee = await employeeRepository.GetDetailForUpdateAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Không tìm thấy nhân viên hoặc nhân viên đã được xoá.");

        if (await attendanceRepository.GetOpenAttendanceAsync(command.Id, DateTime.UtcNow, cancellationToken) is not null)
            throw new InvalidOperationException(
                "Nhân viên còn ca chưa check-out. Hãy hoàn tất check-out hoặc duyệt giải trình trước khi xoá.");

        return await scheduleRepository.ExecuteInTransactionAsync(async () =>
        {
            var fixedSchedules = await scheduleRepository.GetFixedSchedulesByEmployeeAsync(
                command.Id, track: true, cancellationToken);
            foreach (var schedule in fixedSchedules)
            {
                schedule.Deactivate();
                schedule.SoftDelete(command.DeletedBy);
            }

            var permissions = await employeeRepository.RevokePermissionsAsync(
                command.Id, command.DeletedBy, cancellationToken);
            var cancelledSchedules = await employeeRepository.CancelFutureSchedulesAsync(
                command.Id, effectiveDate, command.DeletedBy, cancellationToken);
            await employeeRepository.CloseActiveRolesAsync(command.Id, effectiveDate, cancellationToken);
            await employeeRepository.CloseDepartmentAssignmentsAsync(command.Id, effectiveDate, cancellationToken);
            await tokenRepository.RevokeAllByUserAsync(command.Id, cancellationToken);

            employee.Deactivate();
            employee.SoftDelete(command.DeletedBy);
            employee.SetTerminationReason(command.LyDo);

            employeeRepository.Update(employee);
            await employeeRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new XoaMemNhanVienResult(command.Id, fixedSchedules.Count, cancelledSchedules, permissions);
        }, cancellationToken);
    }
}
