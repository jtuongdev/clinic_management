using System;

namespace ClinicManagement.Application.DTOs.PatientAuth
{
    public class PatientAuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsAccountLinked { get; set; }
        public string Message { get; set; } = string.Empty;
        public PatientInfoDto Patient { get; set; } = new();
    }

    public class PatientInfoDto
    {
        public int Id { get; set; }
        public string Ho { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SoCCCD { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string GioiTinh { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
    }
}
