using ClinicManagement.Domain.Common;
using System;

namespace ClinicManagement.Domain.System
{
    public class NhatKyHoSoBenhAn : BaseEntity
    {
        public int MaBenhNhan { get; set; }
        public int MaHoSo { get; set; }
        public int MaNguoiDung { get; set; }
        public string HanhDong { get; set; } = string.Empty;
        public string PhanHe { get; set; } = "EMR";
        public string DiaChiIp { get; set; } = string.Empty;
        public DateTime ThoiGian { get; set; } = DateTime.UtcNow;
        public string ChiTiet { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "THANH_CONG";
    }
}
