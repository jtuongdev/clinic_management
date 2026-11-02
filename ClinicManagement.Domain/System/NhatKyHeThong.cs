using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.System
{
    public class NhatKyHeThong : BaseEntity
    {
        public string Bang { get; set; } = string.Empty;
        public int MaBangGhi { get; set; }
        public string HanhDong { get; set; } = string.Empty;  
        public string DuLieuCu { get; set; } = string.Empty;
        public string DuLieuMoi { get; set; } = string.Empty;
        public int? NguoiThucHien { get; set; }
        public string DiaChiIp { get; set; } = string.Empty;
        public DateTime ThoiGian { get; set; }

        public virtual NhanVien? NguoiThucHienNavigation { get; set; }
    }
}
