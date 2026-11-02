using System;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Identity
{
    public class NhanVienVaiTro : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public int MaVaiTro { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual VaiTro VaiTro { get; set; } = null!;
    }
}
