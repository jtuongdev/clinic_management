using ClinicManagement.Domain.Common;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class LichTruc : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public int MaCaTruc { get; set; }
        public DateTime NgayTruc { get; set; }
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual CaTruc CaTruc { get; set; } = null!;
    }
}