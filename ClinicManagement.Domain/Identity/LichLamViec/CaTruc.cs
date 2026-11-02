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
        public double SoGioLam
        {
            get
            {
                var duration = ThoiGianKetThuc - ThoiGianBatDau;
                if (duration <= TimeSpan.Zero)
                    duration += TimeSpan.FromDays(1);
                return duration.TotalHours;
            }
        }
        public decimal HeSo { get; set; } = 1.0m;
        public string MoTa { get; set; } = string.Empty;

        public virtual LoaiCa LoaiCa { get; set; } = null!;
        public virtual ICollection<LichLamViec> LichLamViecs { get; set; } = new List<LichLamViec>();

        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(TenCa))
                throw new ArgumentException("Tên ca không được để trống.");
            if (MaLoaiCa <= 0)
                throw new ArgumentException("Loại ca không hợp lệ.");
            if (HeSo <= 0)
                throw new ArgumentOutOfRangeException(nameof(HeSo), "Hệ số ca phải lớn hơn 0.");
            if (SoGioLam <= 0 || SoGioLam > 24)
                throw new ArgumentException("Thời lượng ca phải lớn hơn 0 và không quá 24 giờ.");
        }
    }
}