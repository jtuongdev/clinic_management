using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record CheckInCommand(int MaLichLamViec) : IRequest<ChamCongDto>;
    public record CheckOutCommand(int MaLichLamViec) : IRequest<ChamCongDto>;
    public record GetChamCongQuery(DateTime FromDate, DateTime ToDate, int? MaNhanVien = null) : IRequest<IReadOnlyList<ChamCongDto>>;
    public record FinalizeAbsentAttendanceCommand(DateTime? Now = null) : IRequest<int>;
    public record CreateAttendanceAdjustmentCommand(AttendanceAdjustmentRequest Request, int ActorId) : IRequest<AttendanceAdjustmentDto>;
    public record ReviewAttendanceAdjustmentCommand(int Id, int ReviewerId, bool Approved, string? Note) : IRequest<AttendanceAdjustmentDto>;
    public record GetAttendanceAdjustmentsQuery(DateTime? FromDate = null, DateTime? ToDate = null, string? Status = null) : IRequest<IReadOnlyList<AttendanceAdjustmentDto>>;
    public record CreateAttendancePeriodCommand(CreateAttendancePeriodRequest Request) : IRequest<AttendancePeriodDto>;
    public record GetAttendancePeriodsQuery : IRequest<IReadOnlyList<AttendancePeriodDto>>;
    public record LockAttendancePeriodCommand(int Id, int UserId, bool Lock) : IRequest<AttendancePeriodDto>;

    public class CheckInHandler : IRequestHandler<CheckInCommand, ChamCongDto>
    {
        private readonly IChamCongRepository repository;
        public CheckInHandler(IChamCongRepository repository) => this.repository = repository;
        public async Task<ChamCongDto> Handle(CheckInCommand request, CancellationToken cancellationToken)
        {
            var schedule = await repository.GetScheduleAsync(request.MaLichLamViec, cancellationToken)
                ?? throw new KeyNotFoundException("Không tìm thấy lịch làm việc.");
            if (schedule.TrangThai is TrangThaiLichLamViec.NGHI or TrangThaiLichLamViec.HUY)
                throw new InvalidOperationException("Lịch này đã được ghi nhận nghỉ.");
            if (await repository.IsPeriodLockedAsync(schedule.NgayLam, cancellationToken)) throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");
            if (await repository.HasApprovedLeaveAsync(schedule.MaNhanVien, schedule.NgayLam, cancellationToken))
                throw new InvalidOperationException("Nhân viên có đơn nghỉ phép đã được duyệt trong ngày này.");
            var now = AttendanceClock.Now();
            var start = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianBatDau);
            if (schedule.NgayLam.Date > now.Date)
                throw new InvalidOperationException("Chưa đến ngày làm việc, không thể chấm công.");
            if (now < start)
                throw new InvalidOperationException($"Chưa đến giờ bắt đầu ca. Có thể check-in từ {start:dd/MM/yyyy HH:mm}.");
            var existing = await repository.GetByScheduleIdAsync(schedule.Id, cancellationToken);
            if (existing != null) throw new InvalidOperationException("Ca này đã được check-in.");
            var attendance = new ChamCong { MaNhanVien = schedule.MaNhanVien, MaLichLamViec = schedule.Id, NgayChamCong = schedule.NgayLam.Date };
            attendance.CheckInAt(now, start);
            await repository.AddAsync(attendance, cancellationToken);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return Map(attendance);
        }
        internal static ChamCongDto Map(ChamCong x) => new() { Id = x.Id, MaNhanVien = x.MaNhanVien, MaLichLamViec = x.MaLichLamViec, TenNhanVien = x.NhanVien?.HoTen ?? string.Empty, NgayChamCong = x.NgayChamCong, CheckIn = x.CheckIn, CheckOut = x.CheckOut, GioLamThucTe = x.GioLamThucTe, PhutDiMuon = x.PhutDiMuon, PhutVeSom = x.PhutVeSom, TrangThai = x.TrangThai.ToString(), GhiChu = x.GhiChu };
    }

    public class CheckOutHandler : IRequestHandler<CheckOutCommand, ChamCongDto>
    {
        private readonly IChamCongRepository repository;
        public CheckOutHandler(IChamCongRepository repository) => this.repository = repository;
        public async Task<ChamCongDto> Handle(CheckOutCommand request, CancellationToken cancellationToken)
        {
            var attendance = await repository.GetByScheduleIdAsync(request.MaLichLamViec, cancellationToken) ?? throw new KeyNotFoundException("Chưa có bản ghi check-in cho ca này.");
            var schedule = await repository.GetScheduleAsync(request.MaLichLamViec, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy lịch làm việc.");
            if (await repository.IsPeriodLockedAsync(schedule.NgayLam, cancellationToken)) throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");
            var end = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianKetThuc);
            if (schedule.CaTruc.ThoiGianKetThuc <= schedule.CaTruc.ThoiGianBatDau) end = end.AddDays(1);
            attendance.CheckOutAt(AttendanceClock.Now(), end);
            repository.Update(attendance);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return CheckInHandler.Map(attendance);
        }

    }

    public class GetChamCongHandler : IRequestHandler<GetChamCongQuery, IReadOnlyList<ChamCongDto>>
    {
        private readonly IChamCongRepository repository;
        public GetChamCongHandler(IChamCongRepository repository) => this.repository = repository;
        public async Task<IReadOnlyList<ChamCongDto>> Handle(GetChamCongQuery request, CancellationToken cancellationToken)
        {
            var items = await repository.GetByDateRangeAsync(request.FromDate, request.ToDate, request.MaNhanVien, cancellationToken);
            return items.Select(CheckInHandler.Map).ToList();
        }

        public class FinalizeAbsentAttendanceHandler : IRequestHandler<FinalizeAbsentAttendanceCommand, int>
        {
            private readonly IChamCongRepository repository;
            public FinalizeAbsentAttendanceHandler(IChamCongRepository repository) => this.repository = repository;
            public async Task<int> Handle(FinalizeAbsentAttendanceCommand request, CancellationToken cancellationToken)
            {
                var count = await repository.FinalizeAbsentAsync(request.Now ?? AttendanceClock.Now(), cancellationToken);
                await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
                return count;
            }
        }

    }

    internal static class AttendanceClock
    {
        public static DateTime Now()
        {
            var timeZoneId = OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh";
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, timeZone);
        }

        internal static class AttendanceAdjustmentMapper
        {
            public static AttendanceAdjustmentDto Map(DieuChinhChamCong x) => new() { Id = x.Id, MaChamCong = x.MaChamCong, MaNhanVien = x.MaNhanVien, CheckInCu = x.CheckInCu, CheckOutCu = x.CheckOutCu, CheckInMoi = x.CheckInMoi, CheckOutMoi = x.CheckOutMoi, LyDo = x.LyDo, TrangThai = x.TrangThai.ToString(), NguoiDuyet = x.NguoiDuyet, ThoiGianDuyet = x.ThoiGianDuyet, GhiChuDuyet = x.GhiChuDuyet };
        }

        public class CreateAttendanceAdjustmentHandler : IRequestHandler<CreateAttendanceAdjustmentCommand, AttendanceAdjustmentDto>
        {
            private readonly IChamCongRepository repository;
            public CreateAttendanceAdjustmentHandler(IChamCongRepository repository) => this.repository = repository;
            public async Task<AttendanceAdjustmentDto> Handle(CreateAttendanceAdjustmentCommand c, CancellationToken ct)
            {
                var r = c.Request; var attendance = await repository.GetByIdAsync(r.MaChamCong, ct) ?? throw new KeyNotFoundException("Không tìm thấy bản ghi chấm công.");
                if (await repository.IsPeriodLockedAsync(attendance.NgayChamCong, ct)) throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");
                if (r.CheckIn.HasValue && r.CheckOut.HasValue && r.CheckOut < r.CheckIn) throw new ArgumentException("Thời gian điều chỉnh không hợp lệ.");
                var entity = new DieuChinhChamCong { MaChamCong = attendance.Id, MaNhanVien = attendance.MaNhanVien, CheckInCu = attendance.CheckIn, CheckOutCu = attendance.CheckOut, CheckInMoi = r.CheckIn, CheckOutMoi = r.CheckOut, LyDo = r.LyDo?.Trim() ?? "" };
                await repository.AddAdjustmentAsync(entity, ct); await repository.UnitOfWork.SaveChangesAsync(ct);
                await repository.AddAuditAsync("ChamCong", attendance.Id, "ADJUSTMENT_REQUESTED", "", $"Yêu cầu điều chỉnh #{entity.Id}", c.ActorId, ct); await repository.UnitOfWork.SaveChangesAsync(ct);
                return AttendanceAdjustmentMapper.Map(entity);
            }
        }

        public class ReviewAttendanceAdjustmentHandler : IRequestHandler<ReviewAttendanceAdjustmentCommand, AttendanceAdjustmentDto>
        {
            private readonly IChamCongRepository repository;
            public ReviewAttendanceAdjustmentHandler(IChamCongRepository repository) => this.repository = repository;
            public async Task<AttendanceAdjustmentDto> Handle(ReviewAttendanceAdjustmentCommand c, CancellationToken ct)
            {
                var x = await repository.GetAdjustmentAsync(c.Id, ct) ?? throw new KeyNotFoundException("Không tìm thấy yêu cầu điều chỉnh.");
                if (await repository.IsPeriodLockedAsync(x.ChamCong.NgayChamCong, ct)) throw new InvalidOperationException("Kỳ chấm công đã bị khóa.");
                if (c.Approved) {
                    var schedule = x.ChamCong.MaLichLamViec.HasValue ? await repository.GetScheduleAsync(x.ChamCong.MaLichLamViec.Value, ct) : null;
                    if (schedule == null) throw new InvalidOperationException("Không tìm thấy lịch làm việc để tính lại công.");
                    var start = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianBatDau); var end = schedule.NgayLam.Date.Add(schedule.CaTruc.ThoiGianKetThuc);
                    if (schedule.CaTruc.ThoiGianKetThuc <= schedule.CaTruc.ThoiGianBatDau) end = end.AddDays(1);
                    x.ChamCong.ApplyAdjustment(x.CheckInMoi, x.CheckOutMoi, start, end); repository.Update(x.ChamCong); x.Approve(c.ReviewerId, c.Note);
                } else x.Reject(c.ReviewerId, c.Note);
                repository.UpdateAdjustment(x); await repository.AddAuditAsync("ChamCong", x.MaChamCong, c.Approved ? "ADJUSTMENT_APPROVED" : "ADJUSTMENT_REJECTED", "", c.Note ?? "", c.ReviewerId, ct); await repository.UnitOfWork.SaveChangesAsync(ct);
                return AttendanceAdjustmentMapper.Map(x);
            }
        }

        public class GetAttendanceAdjustmentsHandler : IRequestHandler<GetAttendanceAdjustmentsQuery, IReadOnlyList<AttendanceAdjustmentDto>>
        {
            private readonly IChamCongRepository repository; public GetAttendanceAdjustmentsHandler(IChamCongRepository repository) => this.repository = repository;
            public async Task<IReadOnlyList<AttendanceAdjustmentDto>> Handle(GetAttendanceAdjustmentsQuery r, CancellationToken ct) { TrangThaiDieuChinhChamCong? s = null; if (!string.IsNullOrWhiteSpace(r.Status) && Enum.TryParse(r.Status, true, out TrangThaiDieuChinhChamCong parsed)) s = parsed; return (await repository.GetAdjustmentsAsync(r.FromDate, r.ToDate, s, ct)).Select(AttendanceAdjustmentMapper.Map).ToList(); }
        }

        internal static class AttendancePeriodMapper { public static AttendancePeriodDto Map(KyChamCong x, int soNhanVien = 0) => new() { Id=x.Id, TuNgay=x.TuNgay, DenNgay=x.DenNgay, DaKhoa=x.DaKhoa, NguoiKhoa=x.NguoiKhoa, ThoiGianKhoa=x.ThoiGianKhoa, GhiChu=x.GhiChu, SoNhanVien=soNhanVien }; }
        public class CreateAttendancePeriodHandler : IRequestHandler<CreateAttendancePeriodCommand, AttendancePeriodDto>
        {
            private readonly IChamCongRepository repository; public CreateAttendancePeriodHandler(IChamCongRepository repository) => this.repository = repository;
            public async Task<AttendancePeriodDto> Handle(CreateAttendancePeriodCommand c, CancellationToken ct) { var x = new KyChamCong { TuNgay=c.Request.TuNgay.Date, DenNgay=c.Request.DenNgay.Date, GhiChu=c.Request.GhiChu?.Trim() ?? "" }; x.Lock(0); x.Unlock(); await repository.AddPeriodAsync(x, ct); await repository.UnitOfWork.SaveChangesAsync(ct); return AttendancePeriodMapper.Map(x); }
        }
        public class GetAttendancePeriodsHandler : IRequestHandler<GetAttendancePeriodsQuery, IReadOnlyList<AttendancePeriodDto>>
        {
            private readonly IChamCongRepository repository; public GetAttendancePeriodsHandler(IChamCongRepository repository) => this.repository = repository;
            public async Task<IReadOnlyList<AttendancePeriodDto>> Handle(GetAttendancePeriodsQuery c, CancellationToken ct)
            {
                var periods = await repository.GetPeriodsAsync(ct);
                var result = new List<AttendancePeriodDto>();
                foreach (var period in periods)
                    result.Add(AttendancePeriodMapper.Map(period, await repository.CountEmployeesInPeriodAsync(period.TuNgay, period.DenNgay, ct)));
                return result;
            }
        }
        public class LockAttendancePeriodHandler : IRequestHandler<LockAttendancePeriodCommand, AttendancePeriodDto>
        {
            private readonly IChamCongRepository repository; public LockAttendancePeriodHandler(IChamCongRepository repository) => this.repository = repository;
            public async Task<AttendancePeriodDto> Handle(LockAttendancePeriodCommand c, CancellationToken ct) { var x=await repository.GetPeriodAsync(c.Id,ct) ?? throw new KeyNotFoundException("Không tìm thấy kỳ chấm công."); if(c.Lock)x.Lock(c.UserId);else x.Unlock(); repository.UpdatePeriod(x); await repository.AddAuditAsync("KyChamCong",x.Id,c.Lock?"LOCK":"UNLOCK","",x.DaKhoa.ToString(),c.UserId,ct); await repository.UnitOfWork.SaveChangesAsync(ct); return AttendancePeriodMapper.Map(x); }
        }
    }
}
