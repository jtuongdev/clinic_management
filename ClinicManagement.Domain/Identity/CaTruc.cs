using ClinicManagement.Domain.Common;
using System;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Identity
{
    public class CaTruc : BaseEntity
    {
        public int MaLoaiCa { get; set; }
        public string TenCa { get; set; } = string.Empty;
        public TimeSpan ThoiGianBatDau { get; set; }
        public TimeSpan ThoiGianKetThuc { get; set; }
        public double SoGioLam => (ThoiGianKetThuc - ThoiGianBatDau).TotalHours;
        public decimal HeSo { get; set; } = 1.0m;
        public string MoTa { get; set; } = string.Empty;

        public virtual LoaiCa LoaiCa { get; set; } = null!;
        public virtual ICollection<LichLamViec> LichLamViecs { get; set; } = new List<LichLamViec>();
        public virtual ICollection<LichTruc> LichTrucs { get; set; } = new List<LichTruc>();
    }
}