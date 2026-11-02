using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Domain.System
{
    public class TokenLamMoi : BaseEntity
    {
        public int? MaNhanVien { get; set; }
        public int? MaBenhNhan { get; set; }
        public string MaToken { get; set; } = string.Empty;
        public DateTime NgayHetHan { get; set; }
        public bool DaHuyBo { get; set; }

        public virtual NhanVien? NhanVien { get; set; }
        public virtual BenhNhan? BenhNhan { get; set; }

        public bool DaHetHan() => NgayHetHan <= DateTime.UtcNow;
        public void HuyBo() => DaHuyBo = true;
    }
}
