using ClinicManagement.Domain.Common;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Identity
{
    public class ChucVu : BaseEntity
    {
        public string TenChucVu { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;

        public virtual ICollection<NhanVien> NhanViens { get; set; }

        public ChucVu()
        {
            NhanViens = new List<NhanVien>();
        }
    }
}
