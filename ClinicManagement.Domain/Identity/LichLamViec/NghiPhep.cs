using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class NghiPhep : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public DateTime TuNgay { get; set; }
        public DateTime DenNgay { get; set; }
        public LoaiNghiPhep LoaiNghi { get; set; }
        public string LyDo { get; set; } = string.Empty;
        public TrangThaiNghiPhep TrangThai { get; set; } = TrangThaiNghiPhep.CHO_DUYET;
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
            if (!Enum.IsDefined(LoaiNghi)) throw new ArgumentException("Loại nghỉ không hợp lệ.");
            if (string.IsNullOrWhiteSpace(LyDo)) throw new ArgumentException("Lý do nghỉ không được để trống.");
        }

        public void Approve(int nguoiDuyet)
        {
            if (TrangThai != TrangThaiNghiPhep.CHO_DUYET) throw new InvalidOperationException("Đơn nghỉ không còn chờ duyệt.");
            TrangThai = TrangThaiNghiPhep.DA_DUYET;
            NguoiDuyet = nguoiDuyet;
            NgayDuyet = DateTime.UtcNow;
        }

        public void Reject(int nguoiDuyet, string ghiChu)
        {
            if (TrangThai != TrangThaiNghiPhep.CHO_DUYET) throw new InvalidOperationException("Đơn nghỉ không còn chờ duyệt.");
            TrangThai = TrangThaiNghiPhep.TU_CHOI;
            NguoiDuyet = nguoiDuyet;
            NgayDuyet = DateTime.UtcNow;
            GhiChu = ghiChu?.Trim() ?? string.Empty;
        }

        public void Cancel()
        {
            if (TrangThai is TrangThaiNghiPhep.TU_CHOI or TrangThaiNghiPhep.HUY)
                throw new InvalidOperationException("Không thể hủy đơn nghỉ ở trạng thái hiện tại.");
            TrangThai = TrangThaiNghiPhep.HUY;
        }
    }
}