using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record PhanLichHangLoatCommand(BulkScheduleRequest Request) : IRequest<BulkScheduleResult>;
    public class PhanLichHangLoatHandler : IRequestHandler<PhanLichHangLoatCommand, BulkScheduleResult>
    {
        private readonly ILichLamViecRepository repository;
        public PhanLichHangLoatHandler(ILichLamViecRepository repository) => this.repository = repository;
        public async Task<BulkScheduleResult> Handle(PhanLichHangLoatCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            if (request.TuNgay.Date > request.DenNgay.Date || request.MaKhoa <= 0 || request.MaNhanVien.Count == 0) throw new ArgumentException("Khoa, khoảng ngày hoặc danh sách nhân viên không hợp lệ.");
            var result = new BulkScheduleResult();
            var allowedDays = request.ThuTrongTuan?.ToHashSet();
            for (var date = request.TuNgay.Date; date <= request.DenNgay.Date; date = date.AddDays(1))
            {
                if (allowedDays != null && !allowedDays.Contains(date.DayOfWeek)) continue;
                foreach (var employeeId in request.MaNhanVien.Distinct())
                {
                    if (!await repository.IsEmployeeAssignedToDepartmentAsync(employeeId, request.MaKhoa, date, cancellationToken))
                    {
                        result.SkippedDates.Add(date);
                        continue;
                    }
                    if (await repository.HasConflictAsync(employeeId, request.MaCaTruc, date, cancellationToken: cancellationToken)) { result.SkippedDates.Add(date); continue; }
                    await repository.AddAsync(new Domain.Identity.LichLamViec { MaNhanVien = employeeId, MaKhoa = request.MaKhoa, MaCaTruc = request.MaCaTruc, NgayLam = date, GhiChu = request.GhiChu?.Trim() ?? string.Empty }, cancellationToken);
                    result.CreatedCount++;
                }
            }
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return result;
        }
    }
}
