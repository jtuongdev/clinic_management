using System;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Examination
{
    public class SinhHieu : BaseEntity
    {
        public int MaLuotKham { get; set; }
        public DateTime ThoiDiemDo { get; set; }
        public int? HuyetApTamThu { get; set; }
        public int? HuyetApTamTruong { get; set; }
        public int? Mach { get; set; }
        public decimal? NhietDo { get; set; }
        public decimal? CanNang { get; set; }
        public decimal? ChieuCao { get; set; }
        public decimal? SpO2 { get; set; }
        public int? CreatedBy { get; set; }

        // Navigation
        public virtual LuotKham LuotKham { get; set; }
    }
}