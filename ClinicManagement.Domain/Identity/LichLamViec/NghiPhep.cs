using ClinicManagement.Domain.Common;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class NghiPhep : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public DateTime TuNgay { get; set; }
        public DateTime DenNgay { get; set; }
        public string LoaiNghi { get; set; } = string.Empty; // PHEP_NAM, PHEP_BENH, PHEP_RIENG, KHONG_LUONG
        public string LyDo { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "CHO_DUYET"; // CHO_DUYET, DA_DUYET, TU_CHOI, HUY
        public int? NguoiDuyet { get; set; }
        public DateTime? NgayDuyet { get; set; }
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual NhanVien NguoiDuyetNavigation { get; set; } = null!;

        public void ValidateDates()
        {
            TuNgay = TuNgay.Date;
            DenNgay = DenNgay.Date;
            if (DenNgay < TuNgay) throw new ArgumentException("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.");
            if (string.IsNullOrWhiteSpace(LoaiNghi)) throw new ArgumentException("Loại nghỉ không được để trống.");
            if (string.IsNullOrWhiteSpace(LyDo)) throw new ArgumentException("Lý do nghỉ không được để trống.");
        }

        public void Approve(int nguoiDuyet)
        {
            if (TrangThai != "CHO_DUYET") throw new InvalidOperationException("Đơn nghỉ không còn chờ duyệt.");
            TrangThai = "DA_DUYET";
            NguoiDuyet = nguoiDuyet;
            NgayDuyet = DateTime.UtcNow;
        }

        public void Reject(int nguoiDuyet, string ghiChu)
        {
            if (TrangThai != "CHO_DUYET") throw new InvalidOperationException("Đơn nghỉ không còn chờ duyệt.");
            TrangThai = "TU_CHOI";
            NguoiDuyet = nguoiDuyet;
            NgayDuyet = DateTime.UtcNow;
            GhiChu = ghiChu?.Trim() ?? string.Empty;
        }

        public void Cancel()
        {
            if (TrangThai is "DA_DUYET" or "TU_CHOI" or "HUY")
                throw new InvalidOperationException("Không thể hủy đơn nghỉ ở trạng thái hiện tại.");
            TrangThai = "HUY";
        }
    }
}