using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Domain.System
{
    public class ThamSoHeThong : BaseEntity
    {
        public int? MaCoSo { get; set; }
        public string TenThamSo { get; set; } = string.Empty;
        public string GiaTri { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;

        public virtual CoSo? CoSo { get; set; }
    }
}
