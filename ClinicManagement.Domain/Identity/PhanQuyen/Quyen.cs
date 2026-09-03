using ClinicManagement.Domain.Common;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Identity
{
    public class Quyen : BaseEntity
    {
        public string TenQuyen { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;

        public virtual ICollection<VaiTroQuyen> VaiTroQuyens { get; set; }

        public Quyen()
        {
            VaiTroQuyens = new List<VaiTroQuyen>();
        }
    }
}
