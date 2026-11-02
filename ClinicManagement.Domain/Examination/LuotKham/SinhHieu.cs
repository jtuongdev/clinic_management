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

        public void Update(
            int? huyetApTamThu,
            int? huyetApTamTruong,
            int? mach,
            decimal? nhietDo,
            decimal? canNang,
            decimal? chieuCao,
            decimal? spO2)
        {
            HuyetApTamThu = huyetApTamThu;
            HuyetApTamTruong = huyetApTamTruong;
            Mach = mach;
            NhietDo = nhietDo;
            CanNang = canNang;
            ChieuCao = chieuCao;
            SpO2 = spO2;
        }
    }
}