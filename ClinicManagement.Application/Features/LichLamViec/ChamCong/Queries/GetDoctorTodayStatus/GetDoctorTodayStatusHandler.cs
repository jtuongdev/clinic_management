using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public class GetDoctorTodayStatusHandler : IRequestHandler<GetDoctorTodayStatusQuery, DoctorTodayStatusDto>
{
    private readonly ILichLamViecRepository scheduleRepository;
    private readonly IChamCongRepository attendanceRepository;

    public GetDoctorTodayStatusHandler(
        ILichLamViecRepository scheduleRepository,
        IChamCongRepository attendanceRepository)
    {
        this.scheduleRepository = scheduleRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public async Task<DoctorTodayStatusDto> Handle(GetDoctorTodayStatusQuery request, CancellationToken cancellationToken)
    {
        var now = DongHoChamCong.Now();
        var today = now.Date;

        // 1. Kiểm tra xem có ca nào đang mở (đã check-in nhưng chưa check-out, kể cả ca từ hôm qua kéo dài qua đêm)
        var openAttendance = await attendanceRepository.GetOpenAttendanceAsync(request.EmployeeId, now, cancellationToken);

        // 2. Lấy lịch làm việc hôm nay và dữ liệu chấm công hôm nay
        var schedulesToday = await scheduleRepository.GetByDateRangeAsync(today, today, request.EmployeeId, null, cancellationToken);
        var attendancesToday = await attendanceRepository.GetByDateRangeAsync(today, today, request.EmployeeId, null, cancellationToken);

        // Lấy tất cả các ca của hôm nay
        var workSchedules = schedulesToday
            .Where(s => s.TrangThai == TrangThaiLichLamViec.LAM_VIEC && s.CaTruc != null)
            .OrderBy(s => s.CaTruc!.ThoiGianBatDau)
            .ToList();

        var shiftDtos = new List<DoctorShiftItemDto>();

        foreach (var s in workSchedules)
        {
            var ca = s.CaTruc!;
            var start = s.NgayLam.Date.Add(ca.ThoiGianBatDau);
            var end = s.NgayLam.Date.Add(ca.ThoiGianKetThuc);
            if (ca.ThoiGianKetThuc <= ca.ThoiGianBatDau)
                end = end.AddDays(1);

            var att = attendancesToday.FirstOrDefault(a => a.MaLichLamViec == s.Id);
            
            var hasCheckedIn = att?.CheckIn != null;
            var hasCheckedOut = att?.CheckOut != null;
            var isExpired = !hasCheckedIn && now > end;
            var isOpenWindow = now >= start.AddMinutes(-60) && now <= end;
            var canCheckIn = !hasCheckedIn && !isExpired && now >= start.AddMinutes(-60);
            var canCheckOut = hasCheckedIn && !hasCheckedOut;

            shiftDtos.Add(new DoctorShiftItemDto
            {
                Id = s.Id,
                MaCaTruc = s.MaCaTruc,
                TenCa = ca.TenCa,
                ThoiGianBatDau = ca.ThoiGianBatDau,
                ThoiGianKetThuc = ca.ThoiGianKetThuc,
                TenKhoa = s.Khoa?.Ten ?? string.Empty,
                TenPhongKham = s.PhongKham?.Ten ?? string.Empty,
                NguonLich = s.NguonLich.ToString(),
                TrangThaiLich = s.TrangThai.ToString(),
                CheckIn = att?.CheckIn,
                CheckOut = att?.CheckOut,
                TrangThaiChamCong = att?.TrangThai.ToString() ?? (isExpired ? "VANG_MAT" : "CHUA_CHAM_CONG"),
                IsCurrentActive = false,
                CanCheckIn = canCheckIn,
                CanCheckOut = canCheckOut,
                IsExpired = isExpired
            });
        }

        // 3. Quyết định ca active (activeSchedule & activeAttendance)
        Domain.Identity.LichLamViec? chosenSchedule = null;
        ChamCongDto? activeAttendance = null;

        if (openAttendance != null)
        {
            activeAttendance = AnhXaChamCong.ToDto(openAttendance);
            if (openAttendance.MaLichLamViec.HasValue)
            {
                chosenSchedule = workSchedules.FirstOrDefault(s => s.Id == openAttendance.MaLichLamViec.Value);
                if (chosenSchedule == null)
                {
                    chosenSchedule = openAttendance.LichLamViec ?? await attendanceRepository.GetScheduleAsync(openAttendance.MaLichLamViec.Value, cancellationToken);
                }
            }
        }
        else
        {
            // Không có ca đang mở
            // Priority A: Ca đang trong khung giờ check-in (từ start-60m đến end) và chưa check-in
            var inWindow = workSchedules.FirstOrDefault(s =>
            {
                var ca = s.CaTruc!;
                var start = s.NgayLam.Date.Add(ca.ThoiGianBatDau);
                var end = s.NgayLam.Date.Add(ca.ThoiGianKetThuc);
                if (ca.ThoiGianKetThuc <= ca.ThoiGianBatDau) end = end.AddDays(1);
                var att = attendancesToday.FirstOrDefault(a => a.MaLichLamViec == s.Id);
                return (att == null || !att.CheckIn.HasValue) && now >= start.AddMinutes(-60) && now <= end;
            });

            if (inWindow != null)
            {
                chosenSchedule = inWindow;
            }
            else
            {
                // Priority B: Ca tiếp theo sắp diễn ra trong tương lai (start > now)
                var upcoming = workSchedules.FirstOrDefault(s =>
                {
                    var ca = s.CaTruc!;
                    var start = s.NgayLam.Date.Add(ca.ThoiGianBatDau);
                    var att = attendancesToday.FirstOrDefault(a => a.MaLichLamViec == s.Id);
                    return (att == null || !att.CheckIn.HasValue) && start > now;
                });

                if (upcoming != null)
                {
                    chosenSchedule = upcoming;
                }
                else
                {
                    // Priority C: Ca cuối cùng trong ngày nếu tất cả đã qua hoặc đã hoàn thành
                    chosenSchedule = workSchedules.LastOrDefault();
                }
            }

            if (chosenSchedule != null)
            {
                var att = attendancesToday.FirstOrDefault(a => a.MaLichLamViec == chosenSchedule.Id);
                if (att != null)
                {
                    activeAttendance = AnhXaChamCong.ToDto(att);
                }
            }
        }

        // Đánh dấu IsCurrentActive trong danh sách shiftDtos
        if (chosenSchedule != null)
        {
            var activeShift = shiftDtos.FirstOrDefault(s => s.Id == chosenSchedule.Id);
            if (activeShift != null)
            {
                activeShift.IsCurrentActive = true;
            }
        }

        var mappedSchedule = chosenSchedule != null ? CreateLichLamViecHandler.Map(chosenSchedule) : null;
        var canCheckInOverall = chosenSchedule != null && (activeAttendance == null || !activeAttendance.CheckIn.HasValue);
        var canCheckOutOverall = activeAttendance != null && activeAttendance.CheckIn.HasValue && !activeAttendance.CheckOut.HasValue;

        return new DoctorTodayStatusDto
        {
            Date = today,
            HasSchedule = mappedSchedule != null,
            Schedule = mappedSchedule,
            Attendance = activeAttendance,
            CanCheckIn = canCheckInOverall,
            CanCheckOut = canCheckOutOverall,
            Shifts = shiftDtos
        };
    }
}
