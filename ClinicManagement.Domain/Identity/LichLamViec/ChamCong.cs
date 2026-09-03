using ClinicManagement.Domain.Common;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class ChamCong : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public DateTime NgayChamCong { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string TrangThai { get; set; } = "DI_LAM"; // DI_LAM, VANG_MAT, DI_MUON, VE_SOM, NGHI_PHEP, NGHI_OM
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;

        public void CheckInAt(DateTime time)
        {
            if (CheckIn.HasValue) throw new InvalidOperationException("Nhân viên đã check-in.");
            CheckIn = time;
            NgayChamCong = time.Date;
            TrangThai = "DI_LAM";
        }

        public void CheckOutAt(DateTime time)
        {
            if (!CheckIn.HasValue) throw new InvalidOperationException("Phải check-in trước khi check-out.");
            if (CheckOut.HasValue) throw new InvalidOperationException("Nhân viên đã check-out.");
            if (time < CheckIn.Value) throw new InvalidOperationException("Thời gian check-out không hợp lệ.");
            CheckOut = time;
        }
    }
}