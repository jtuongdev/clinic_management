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
    }
}