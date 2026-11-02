using ClinicManagement.Domain.Common;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Identity
{
    public class LoaiCa : BaseEntity
    {
        public string Ma { get; set; } = string.Empty;
        public string TenLoai { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;

        public virtual ICollection<CaTruc> CaTrucs { get; set; } = new List<CaTruc>();
    }
}