using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Service
{
    public class DanhMucDichVu : BaseEntity, IAggregateRoot
    {
        public LoaiDichVu LoaiDichVu { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string DonViTinh { get; set; } = string.Empty;
        public decimal Gia { get; set; }

        public virtual ICollection<ChiDinhDichVu> ChiDinhDichVus { get; set; }

        public DanhMucDichVu()
        {
            ChiDinhDichVus = new List<ChiDinhDichVu>();
        }
    }
}
