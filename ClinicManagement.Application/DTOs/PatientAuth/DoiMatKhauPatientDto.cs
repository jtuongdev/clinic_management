using System.ComponentModel.DataAnnotations;

namespace ClinicManagement.Application.DTOs.PatientAuth
{
    public class GuiMaXacNhanDoiMatKhauDto
    {
        [Required(ErrorMessage = "Vui lòng nhập địa chỉ email")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Tùy chọn: SĐT, CCCD hoặc Mã bệnh nhân (hữu ích khi quên mật khẩu ngoài màn hình đăng nhập)
        /// </summary>
        public string? TaiKhoan { get; set; }
    }

    public class XacMinhMaOtpDoiMatKhauDto
    {
        [Required(ErrorMessage = "Vui lòng nhập địa chỉ email")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập mã xác nhận")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã xác nhận gồm 6 chữ số")]
        public string OtpCode { get; set; } = string.Empty;
    }

    public class DoiMatKhauBangOtpDto
    {
        [Required(ErrorMessage = "Vui lòng nhập địa chỉ email")]
        [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập mã xác nhận")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã xác nhận gồm 6 chữ số")]
        public string OtpCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải từ 6 ký tự trở lên")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
