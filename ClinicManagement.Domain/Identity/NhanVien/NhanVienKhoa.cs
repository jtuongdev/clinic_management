using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Domain.Identity
{
    public class NhanVienKhoa : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public int MaKhoa { get; set; }
        public DateTime TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public bool LaKhoaChinh { get; set; }

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual Khoa Khoa { get; set; } = null!;
    }
}
