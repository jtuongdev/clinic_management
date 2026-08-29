using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Service
{
    public class ChiTietKetQuaXetNghiem : BaseEntity
    {
        public int MaChiDinh { get; set; }
        public string TenChiSo { get; set; } = string.Empty;
        public string GiaTri { get; set; } = string.Empty;
        public string DonVi { get; set; } = string.Empty;
        public string KhoangThamChieu { get; set; } = string.Empty;
        public bool? BatThuong { get; set; }

        public virtual ChiDinhDichVu ChiDinhDichVu { get; set; } = null!;
    }
}
