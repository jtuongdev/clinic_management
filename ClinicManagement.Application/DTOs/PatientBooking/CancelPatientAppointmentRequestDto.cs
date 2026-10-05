using System.ComponentModel.DataAnnotations;

namespace ClinicManagement.Application.DTOs.PatientBooking
{
    public class CancelPatientAppointmentRequestDto
    {
        [Required(ErrorMessage = "Lý do hủy không được để trống")]
        public string LyDoHuy { get; set; } = string.Empty;
    }
}
