using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Domain.Identity
{
    public class PhanQuyenCoSo : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public int MaCoSo { get; set; }
        public int MaVaiTro { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual CoSo CoSo { get; set; } = null!;
        public virtual VaiTro VaiTro { get; set; } = null!;
    }
}
