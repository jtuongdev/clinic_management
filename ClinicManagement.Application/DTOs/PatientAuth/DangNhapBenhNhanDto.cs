using System.ComponentModel.DataAnnotations;

namespace ClinicManagement.Application.DTOs.PatientAuth
{
    public class DangNhapBenhNhanDto
    {
        [Required(ErrorMessage = "Tài khoản, số điện thoại hoặc CCCD không được để trống")]
        public string TaiKhoan { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string Password { get; set; } = string.Empty;
    }
}
