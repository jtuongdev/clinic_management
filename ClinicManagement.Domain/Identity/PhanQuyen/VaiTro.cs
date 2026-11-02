using ClinicManagement.Domain.Common;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Identity
{
    public class VaiTro : BaseEntity
    {
        public string TenVaiTro { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;

        public virtual ICollection<NhanVienVaiTro> NhanVienVaiTro { get; set; }
        public virtual ICollection<PhanQuyenCoSo> PhanQuyenCoSo { get; set; }

        public VaiTro()
        {
            NhanVienVaiTro = new List<NhanVienVaiTro>();
            PhanQuyenCoSo = new List<PhanQuyenCoSo>();
        }
    }
}
