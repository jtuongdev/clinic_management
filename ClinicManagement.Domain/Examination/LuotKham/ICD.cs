using ClinicManagement.Domain.Common;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Examination
{
    public class ICD : BaseEntity
    {
        public string MaICD { get; set; } = string.Empty;
        public string TenICD { get; set; } = string.Empty;
        public string Chuong { get; set; } = string.Empty;

        public virtual ICollection<ChanDoan> ChanDoans { get; set; }

        public ICD()
        {
            ChanDoans = new List<ChanDoan>();
        }
    }
}
