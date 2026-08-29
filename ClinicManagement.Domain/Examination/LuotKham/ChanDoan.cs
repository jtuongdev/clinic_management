using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Examination
{
    public class ChanDoan : BaseEntity
    {
        public int MaLuotKham { get; set; }
        public string MaICD { get; set; } = string.Empty;
        public string TenChanDoan { get; set; } = string.Empty;
        public bool LaChanDoanChinh { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }

        public virtual LuotKham LuotKham { get; set; } = null!;
        public virtual ICD ICD { get; set; } = null!;
    }
}
