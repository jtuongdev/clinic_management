using ClinicManagement.Domain.Common;
using System;

namespace ClinicManagement.Domain.System
{
    public class CauHinhTichHop : BaseEntity
    {
        public string DanhMuc { get; set; } = string.Empty;
        public string MaCode { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string GiaTri { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public bool DaMaHoa { get; set; }
        public int? NguoiCapNhat { get; set; }
        public DateTime ThoiGianCapNhat { get; set; } = DateTime.UtcNow;
    }
}
