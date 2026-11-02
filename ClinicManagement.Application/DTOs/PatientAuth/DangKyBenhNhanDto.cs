using System;
using System.ComponentModel.DataAnnotations;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.PatientAuth
{
    public class DangKyBenhNhanDto
    {
        [Required(ErrorMessage = "Họ không được để trống")]
        public string Ho { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên không được để trống")]
        public string Ten { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string DienThoai { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        public string Password { get; set; } = string.Empty;

        public DateTime? NgaySinh { get; set; }
        public GioiTinh GioiTinh { get; set; } = GioiTinh.O;
        public string? Email { get; set; }
        public string? SoCCCD { get; set; }
        public string? DiaChi { get; set; }
    }
}
