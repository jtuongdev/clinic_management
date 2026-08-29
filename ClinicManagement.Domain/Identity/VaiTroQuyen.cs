using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Identity
{
    public class VaiTroQuyen : BaseEntity
    {
        public int MaVaiTro { get; set; }
        public int MaQuyen { get; set; }

        public virtual VaiTro VaiTro { get; set; } = null!;
        public virtual Quyen Quyen { get; set; } = null!;
    }
}
