using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class TaoDieuChinhChamCongCommandHandler : IRequestHandler<TaoDieuChinhChamCongCommand, AttendanceAdjustmentDto>
{
    private readonly IChamCongRepository repository;
    public TaoDieuChinhChamCongCommandHandler(IChamCongRepository repository) => this.repository = repository;

    public async Task<AttendanceAdjustmentDto> Handle(TaoDieuChinhChamCongCommand c, CancellationToken ct)
    {
        var r = c.Request;
        var attendance = await repository.GetByIdAsync(r.MaChamCong, ct) ?? throw new KeyNotFoundException("Không tìm thấy bản ghi chấm công.");
        if (await repository.IsPeriodLockedAsync(attendance.NgayChamCong, ct))
            throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");
        if (r.CheckIn.HasValue && r.CheckOut.HasValue && r.CheckOut < r.CheckIn)
            throw new ArgumentException("Thời gian điều chỉnh không hợp lệ.");

        var entity = new DieuChinhChamCong
        {
            MaChamCong = attendance.Id,
            MaNhanVien = attendance.MaNhanVien,
            CheckInCu = attendance.CheckIn,
            CheckOutCu = attendance.CheckOut,
            CheckInMoi = r.CheckIn,
            CheckOutMoi = r.CheckOut,
            LyDo = r.LyDo?.Trim() ?? ""
        };

        await repository.AddAdjustmentAsync(entity, ct);
        await repository.UnitOfWork.SaveChangesAsync(ct);
        await repository.AddAuditAsync("ChamCong", attendance.Id, "ADJUSTMENT_REQUESTED", "", $"Yêu cầu điều chỉnh #{entity.Id}", c.ActorId, ct);
        await repository.UnitOfWork.SaveChangesAsync(ct);

        return AnhXaChamCong.ToDto(entity);
    }
}
