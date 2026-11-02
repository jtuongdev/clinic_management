using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Examination;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Facility
{
    public class Khoa : BaseEntity, IAggregateRoot
    {
        public int MaCoSo { get; set; }
        public int? MaKhoaCha { get; set; }
        public string Ma { get; set; }
        public string Ten { get; set; }
        

        // Navigation
        public virtual CoSo CoSo { get; set; }
        public virtual Khoa KhoaCha { get; set; }
        public virtual ICollection<Khoa> KhoaCon { get; set; }
        public virtual ICollection<PhongKham> PhongKhams { get; set; }
        public virtual ICollection<NhanVienKhoa> NhanVienKhoa { get; set; }
        public virtual ICollection<LuotKham> LuotKhams { get; set; } = new List<LuotKham>();
        public Khoa()
        {
            PhongKhams = new List<PhongKham>();
            NhanVienKhoa = new List<NhanVienKhoa>();
            KhoaCon = new List<Khoa>();
            LuotKhams = new List<Examination.LuotKham>();
        }
        
    }
}