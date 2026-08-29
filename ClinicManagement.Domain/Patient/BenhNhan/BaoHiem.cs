using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Patient
{
    public class BaoHiem : BaseEntity
    {
        public int MaBenhNhan { get; set; }
        public LoaiBaoHiem LoaiBaoHiem { get; set; }
        public string TenNhaCungCap { get; set; } = string.Empty;
        public string SoThe { get; set; } = string.Empty;
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public decimal MucHuong { get; set; }
        public virtual BenhNhan BenhNhan { get; set; } = null!;

        public bool IsValid() => NgayBatDau <= DateTime.UtcNow.Date && NgayKetThuc >= DateTime.UtcNow.Date;
    }
}
