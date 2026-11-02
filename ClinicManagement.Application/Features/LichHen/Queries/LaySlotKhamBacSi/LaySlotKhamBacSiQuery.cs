using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LichHen.Queries.LaySlotKhamBacSi
{
    public class LaySlotKhamBacSiQuery : IRequest<List<TimeSlotDto>>
    {
        public int MaBacSi { get; set; }
        public DateTime NgayKham { get; set; }
    }

    public class LaySlotKhamBacSiQueryHandler : IRequestHandler<LaySlotKhamBacSiQuery, List<TimeSlotDto>>
    {
        private readonly ILichLamViecRepository _lichLamViecRepo;
        private readonly ILichHenRepository _lichHenRepo;

        public LaySlotKhamBacSiQueryHandler(ILichLamViecRepository lichLamViecRepo, ILichHenRepository lichHenRepo)
        {
            _lichLamViecRepo = lichLamViecRepo;
            _lichHenRepo = lichHenRepo;
        }

        public async Task<List<TimeSlotDto>> Handle(LaySlotKhamBacSiQuery request, CancellationToken cancellationToken)
        {
            var date = request.NgayKham.Date;
            var startOfDay = date;
            var endOfDay = date.AddDays(1).AddTicks(-1);

            // 1. Kiểm tra lịch làm việc của bác sĩ trong ngày
            var lichLamViecs = await _lichLamViecRepo.GetByDateRangeAsync(
                date,
                date,
                request.MaBacSi,
                null,
                cancellationToken);

            var activeSchedules = lichLamViecs
                .Where(llv => llv.TrangThai == TrangThaiLichLamViec.LAM_VIEC)
                .ToList();

            var workingIntervals = new List<(TimeSpan Start, TimeSpan End)>();

            if (activeSchedules.Count > 0)
            {
                foreach (var llv in activeSchedules)
                {
                    if (llv.CaTruc != null)
                    {
                        workingIntervals.Add((llv.CaTruc.ThoiGianBatDau, llv.CaTruc.ThoiGianKetThuc));
                    }
                }
            }
            else
            {
                // Fallback khung giờ khám tiêu chuẩn của phòng khám: Ca sáng 08:00 - 12:00, Ca chiều 13:30 - 17:00
                workingIntervals.Add((new TimeSpan(8, 0, 0), new TimeSpan(12, 0, 0)));
                workingIntervals.Add((new TimeSpan(13, 30, 0), new TimeSpan(17, 0, 0)));
            }

            // 2. Chia các ca làm việc thành các slot 30 phút
            var slotInterval = TimeSpan.FromMinutes(30);
            var potentialSlots = new List<(DateTime Start, DateTime End)>();

            foreach (var (caStart, caEnd) in workingIntervals)
            {
                var cur = date.Add(caStart);
                var end = date.Add(caEnd);

                while (cur + slotInterval <= end)
                {
                    potentialSlots.Add((cur, cur + slotInterval));
                    cur += slotInterval;
                }
            }

            // 3. Lấy danh sách lịch hẹn hiện có của bác sĩ trong ngày
            var existingAppointments = await _lichHenRepo.GetAppointmentsByDoctorAndDateAsync(
                request.MaBacSi,
                date,
                cancellationToken);

            const int maxPerSlot = 2; // Giới hạn tối đa 2 bệnh nhân trên mỗi khung giờ 30p

            var result = potentialSlots.Select(slot =>
            {
                var bookedCount = existingAppointments.Count(a =>
                    a.ThoiGianBatDau < slot.End && a.ThoiGianKetThuc > slot.Start);

                return new TimeSlotDto
                {
                    ThoiGianBatDau = slot.Start,
                    ThoiGianKetThuc = slot.End,
                    SoLuongDaDat = bookedCount,
                    SoLuongToiDa = maxPerSlot
                };
            }).ToList();

            return result;
        }
    }
}
