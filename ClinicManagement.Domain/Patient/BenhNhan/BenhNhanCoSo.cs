using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Domain.Patient
{
    public class BenhNhanCoSo : BaseEntity
    {
        public int MaBenhNhan { get; set; }
        public int MaCoSo { get; set; }
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public DateTime NgayDangKy { get; set; }
        public int? CreatedBy { get; set; }

        public virtual BenhNhan BenhNhan { get; set; } = null!;
        public virtual CoSo CoSo { get; set; } = null!;
    }
}
