using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Patient;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Billing
{
    public class PhieuThu : BaseEntity
    {
        public string SoPhieuThu { get; set; } = string.Empty;
        public int MaBenhNhan { get; set; }
        public int? MaLuotKham { get; set; }
        public int MaHoaDon { get; set; }
        public decimal SoTien { get; set; }
        public DateTime NgayThu { get; set; }
        public PhuongThucThanhToan PhuongThuc { get; set; }
        public int MaNguoiThu { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }

        public virtual BenhNhan BenhNhan { get; set; } = null!;
        public virtual LuotKham? LuotKham { get; set; }
        public virtual HoaDon HoaDon { get; set; } = null!;
        public virtual NhanVien NguoiThu { get; set; } = null!;
    }
}
