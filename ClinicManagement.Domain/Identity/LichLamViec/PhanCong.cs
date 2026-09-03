using ClinicManagement.Domain.Common;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class PhanCong : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public string LoaiCongViec { get; set; } = string.Empty;
        public int MaDoiTuong { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;
    }
}