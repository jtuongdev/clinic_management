using System.ComponentModel.DataAnnotations;

namespace ClinicManagement.Application.DTOs.PatientAuth
{
    public class RefreshTokenPatientDto
    {
        [Required(ErrorMessage = "RefreshToken không được để trống")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
