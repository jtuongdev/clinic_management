using System;
using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace ClinicManagement.Application.Features.PatientAuth.Commands.DoiMatKhauBenhNhan
{
    public sealed class PatientPasswordOtpEntry
    {
        public int PatientId { get; init; }
        public string Email { get; init; } = string.Empty;
        public string OtpCode { get; init; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public int FailedAttempts { get; set; }
        public bool IsVerified { get; set; }
    }

    /// <summary>
    /// Lưu trữ tạm thời mã OTP xác nhận đổi mật khẩu cho bệnh nhân trong bộ nhớ (hết hạn sau 5 phút).
    /// </summary>
    public static class PatientPasswordOtpStore
    {
        private static readonly ConcurrentDictionary<string, PatientPasswordOtpEntry> _entries = new(StringComparer.OrdinalIgnoreCase);
        private const int MaxFailedAttempts = 5;
        private static readonly TimeSpan OtpLifetime = TimeSpan.FromMinutes(5);

        private static string NormalizeKey(string email) => email.Trim().ToLowerInvariant();

        public static string GenerateAndSaveOtp(int patientId, string email)
        {
            var key = NormalizeKey(email);
            var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");

            var entry = new PatientPasswordOtpEntry
            {
                PatientId = patientId,
                Email = email.Trim(),
                OtpCode = otpCode,
                ExpiresAtUtc = DateTime.UtcNow.Add(OtpLifetime),
                FailedAttempts = 0,
                IsVerified = false
            };

            _entries[key] = entry;
            return otpCode;
        }

        public static PatientPasswordOtpEntry VerifyOtp(string email, string otpCode, bool consume = false)
        {
            var key = NormalizeKey(email);
            if (!_entries.TryGetValue(key, out var entry))
            {
                throw new ArgumentException("Chưa có yêu cầu gửi mã xác nhận cho email này hoặc mã đã hết hạn.");
            }

            if (DateTime.UtcNow > entry.ExpiresAtUtc)
            {
                _entries.TryRemove(key, out _);
                throw new ArgumentException("Mã xác nhận đã hết hạn (quá 5 phút). Vui lòng yêu cầu gửi lại mã mới.");
            }

            if (entry.FailedAttempts >= MaxFailedAttempts)
            {
                _entries.TryRemove(key, out _);
                throw new ArgumentException("Bạn đã nhập sai mã xác nhận quá số lần quy định. Vui lòng yêu cầu gửi lại mã mới.");
            }

            if (!string.Equals(entry.OtpCode, otpCode?.Trim(), StringComparison.Ordinal))
            {
                entry.FailedAttempts++;
                throw new ArgumentException("Mã xác nhận không chính xác.");
            }

            entry.IsVerified = true;
            // Gia hạn thêm 5 phút để người dùng hoàn tất bước nhập mật khẩu mới
            entry.ExpiresAtUtc = DateTime.UtcNow.Add(OtpLifetime);

            if (consume)
            {
                _entries.TryRemove(key, out _);
            }

            return entry;
        }
    }
}
