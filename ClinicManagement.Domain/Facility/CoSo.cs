using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using System.Collections.Generic;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Facility
{
    public class CoSo : BaseEntity, IAggregateRoot
    {
        public LoaiCoSo LoaiCoSo { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;

        public virtual ICollection<Khoa> Khoas { get; set; }
        public virtual ICollection<PhanQuyenCoSo> PhanQuyenCoSo { get; set; }

        public CoSo()
        {
            Khoas = new List<Khoa>();
            PhanQuyenCoSo = new List<PhanQuyenCoSo>();
        }
    }
}
