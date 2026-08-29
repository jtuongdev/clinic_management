using ClinicManagement.Domain.Common;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class ChamCong : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public DateTime NgayChamCong { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string TrangThai { get; set; } = "DI_LAM"; // DI_LAM, VANG_MAT, DI_MUON, VE_SOM, NGHI_PHEP, NGHI_OM
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;
    }
}