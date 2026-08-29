using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Facility
{
    public class PhongKham : BaseEntity, IAggregateRoot
    {
        public int MaKhoa { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "HoatDong"; 

        // Navigation
        public virtual Khoa Khoa { get; set; } = null!;
        public virtual ICollection<Examination.LuotKham> LuotKhams { get; set; }
        public virtual ICollection<NhanVien> NhanViens { get; set; }

        public PhongKham()
        {
            LuotKhams = new List<Examination.LuotKham>();
            NhanViens = new List<NhanVien>();
        }
    }
}