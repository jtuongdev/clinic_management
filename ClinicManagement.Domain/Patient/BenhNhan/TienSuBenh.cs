using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Patient
{
    public class TienSuBenh : BaseEntity
    {
        public int MaBenhNhan { get; set; }
        public LoaiTienSu LoaiTienSu { get; set; }
        public string Ten { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
        public DateTime NgayGhiNhan { get; set; } = DateTime.UtcNow.Date;
        public int? CreatedBy { get; set; }

        public virtual BenhNhan BenhNhan { get; set; } = null!;
    }
}
