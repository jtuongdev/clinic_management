using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Domain.Identity
{
    public class LichLamViecCoDinh : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public int MaKhoa { get; set; }
        public int MaCaTruc { get; set; }
        public int? MaPhongKham { get; set; }
        public DayOfWeek ThuTrongTuan { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime TuNgay { get; set; } = DateTime.Today;
        public DateTime? DenNgay { get; set; }
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual Khoa Khoa { get; set; } = null!;
        public virtual CaTruc CaTruc { get; set; } = null!;
        public virtual PhongKham? PhongKham { get; set; }
        public virtual ICollection<LichLamViec> LichLamViecs { get; set; } = new List<LichLamViec>();

        public void Activate()
        {
            IsActive = true;
        }

        public void Deactivate()
        {
            IsActive = false;
        }

        public void UpdateInfo(int maCaTruc, int? maPhongKham)
        {
            if (maCaTruc <= 0)
                throw new ArgumentException("Ca trực không hợp lệ.", nameof(maCaTruc));
            MaCaTruc = maCaTruc;
            MaPhongKham = maPhongKham;
        }

        public void Normalize()
        {
            if (MaNhanVien <= 0 || MaKhoa <= 0 || MaCaTruc <= 0)
                throw new ArgumentException("Nhân viên, khoa và ca trực không hợp lệ.");
            if (DenNgay.HasValue && DenNgay.Value.Date < TuNgay.Date)
                throw new ArgumentException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
            TuNgay = TuNgay.Date;
            DenNgay = DenNgay?.Date;
            GhiChu = GhiChu?.Trim() ?? string.Empty;
        }
    }
}
