using System.ComponentModel.DataAnnotations;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class AdminChangePatientPasswordRequest
    {
        [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải từ 6 ký tự trở lên")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
