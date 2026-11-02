using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class DuyetDieuChinhChamCongCommandHandler : IRequestHandler<DuyetDieuChinhChamCongCommand, AttendanceAdjustmentDto>
{
    private readonly IChamCongRepository repository;
    public DuyetDieuChinhChamCongCommandHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<AttendanceAdjustmentDto> Handle(DuyetDieuChinhChamCongCommand c, CancellationToken ct)
    {
        var x = await repository.GetAdjustmentAsync(c.Id, ct) ?? throw new KeyNotFoundException("Không tìm thấy yêu cầu điều chỉnh.");
        if (await repository.IsPeriodLockedAsync(x.ChamCong.NgayChamCong, ct))
            throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");

        if (c.Approved)
        {
            var schedule = x.ChamCong.MaLichLamViec.HasValue ? await repository.GetScheduleAsync(x.ChamCong.MaLichLamViec.Value, ct) : null;
            if (schedule == null) throw new InvalidOperationException("Không tìm thấy lịch làm việc để tính lại công.");
            var start = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianBatDau);
            var end = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianKetThuc);
            if (schedule.CaTruc.ThoiGianKetThuc <= schedule.CaTruc.ThoiGianBatDau) end = end.AddDays(1);
            var checkInMoi = DongHoChamCong.NormalizeNullable(x.CheckInMoi);
            var checkOutMoi = DongHoChamCong.NormalizeNullable(x.CheckOutMoi);
            x.ChamCong.ApplyAdjustment(checkInMoi, checkOutMoi, start, end);
            repository.Update(x.ChamCong);
            x.Approve(c.ReviewerId, c.Note);
        }
        else
        {
            x.Reject(c.ReviewerId, c.Note);
        }

        repository.UpdateAdjustment(x);
        await repository.AddAuditAsync("ChamCong", x.MaChamCong, c.Approved ? "ADJUSTMENT_APPROVED" : "ADJUSTMENT_REJECTED", "", c.Note ?? "", c.ReviewerId, ct);
        await repository.UnitOfWork.SaveChangesAsync(ct);

        return AnhXaChamCong.ToDto(x);
    }
}
