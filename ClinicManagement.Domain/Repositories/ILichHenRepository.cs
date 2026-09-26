using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Domain.Appointment;

namespace ClinicManagement.Domain.Repositories
{
    public interface ILichHenRepository : IRepository<LichHen>
    {
        Task<LichHen?> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);

        Task<(IReadOnlyList<LichHen> Items, int TotalCount)> GetPagedAppointmentsAsync(
            int? maCoSo,
            int? maBacSi,
            DateTime? tuNgay,
            DateTime? denNgay,
            string? trangThai,
            string? keyword,
            int pageIndex,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<int> CountAppointmentsInSlotAsync(
            int maBacSi,
            DateTime startTime,
            DateTime endTime,
            int? excludeId = null,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<LichHen>> GetAppointmentsByDoctorAndDateAsync(
            int maBacSi,
            DateTime date,
            CancellationToken cancellationToken = default);
    }
}
