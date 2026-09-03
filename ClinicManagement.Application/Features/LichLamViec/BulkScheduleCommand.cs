using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record BulkScheduleCommand(BulkScheduleRequest Request) : IRequest<BulkScheduleResult>;
    public class BulkScheduleHandler : IRequestHandler<BulkScheduleCommand, BulkScheduleResult>
    {
        private readonly ILichLamViecRepository repository;
        public BulkScheduleHandler(ILichLamViecRepository repository) => this.repository = repository;
        public async Task<BulkScheduleResult> Handle(BulkScheduleCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            if (request.TuNgay.Date > request.DenNgay.Date || request.MaNhanVien.Count == 0) throw new ArgumentException("Khoảng ngày hoặc danh sách nhân viên không hợp lệ.");
            var result = new BulkScheduleResult();
            var allowedDays = request.ThuTrongTuan?.ToHashSet();
            for (var date = request.TuNgay.Date; date <= request.DenNgay.Date; date = date.AddDays(1))
            {
                if (allowedDays != null && !allowedDays.Contains(date.DayOfWeek)) continue;
                foreach (var employeeId in request.MaNhanVien.Distinct())
                {
                    if (await repository.HasConflictAsync(employeeId, request.MaCaTruc, date, cancellationToken: cancellationToken)) { result.SkippedDates.Add(date); continue; }
                    await repository.AddAsync(new Domain.Identity.LichLamViec { MaNhanVien = employeeId, MaCaTruc = request.MaCaTruc, NgayLam = date, GhiChu = request.GhiChu?.Trim() ?? string.Empty }, cancellationToken);
                    result.CreatedCount++;
                }
            }
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return result;
        }
    }
}
