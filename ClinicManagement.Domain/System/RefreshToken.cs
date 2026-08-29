using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Domain.System
{
    public class RefreshToken : BaseEntity
    {
        public int? MaNhanVien { get; set; }
        public int? MaBenhNhan { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public bool IsRevoked { get; set; }
        public int? CreatedBy { get; set; }

        public virtual NhanVien? NhanVien { get; set; }
        public virtual BenhNhan? BenhNhan { get; set; }

        public bool IsExpired() => ExpiryDate <= DateTime.UtcNow;
        public void Revoke() => IsRevoked = true;
    }
}
