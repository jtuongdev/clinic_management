using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Domain.Appointment
{
    /// <summary>
    /// Dịch vụ thông báo (Để ngỏ interface để phát triển SMS Brandname và Zalo ZNS cho giai đoạn sau).
    /// </summary>
    public interface INotificationService
    {
        Task SendAppointmentConfirmationAsync(int appointmentId, string phoneNumber, string patientName, string doctorName, string timeString, CancellationToken cancellationToken = default);
        Task SendAppointmentReminderAsync(int appointmentId, string phoneNumber, string patientName, string timeString, CancellationToken cancellationToken = default);
    }
}
