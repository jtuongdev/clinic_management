using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class LichLamViec : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public int MaKhoa { get; set; }
        public int MaCaTruc { get; set; }
        public int? MaPhongKham { get; set; }
        public int? MaLichLamViecCoDinh { get; set; }
        public string NguonLich { get; set; } = "PHAT_SINH";
        public TrangThaiLichLamViec TrangThai { get; set; } = TrangThaiLichLamViec.LAM_VIEC;
        public DateTime NgayLam { get; set; }
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual Khoa Khoa { get; set; } = null!;
        public virtual CaTruc CaTruc { get; set; } = null!;
        public virtual PhongKham? PhongKham { get; set; }
        public virtual LichLamViecCoDinh? LichLamViecCoDinh { get; set; }

        public void Normalize()
        {
            if (MaNhanVien <= 0) throw new ArgumentException("Nhân viên không hợp lệ.");
            if (MaKhoa <= 0) throw new ArgumentException("Khoa không hợp lệ.");
            if (MaCaTruc <= 0) throw new ArgumentException("Ca làm việc không hợp lệ.");
            NgayLam = NgayLam.Date;
            GhiChu = GhiChu?.Trim() ?? string.Empty;
        }
    }
}