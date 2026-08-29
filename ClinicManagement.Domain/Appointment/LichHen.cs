using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Domain.Appointment
{
    public class LichHen : BaseEntity
    {
        public int MaBenhNhan { get; set; }
        public int MaBacSi { get; set; }
        public int MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public TrangThaiLichHen TrangThai { get; set; }
        public string LyDo { get; set; }
        public string NguonDat { get; set; }  // APP, WEB, CALL_CENTER, LE_TAN
        public int? CreatedBy { get; set; }

        // Navigation
        public virtual BenhNhan BenhNhan { get; set; }
        public virtual NhanVien BacSi { get; set; }
        public virtual CoSo CoSo { get; set; }
        public virtual Khoa Khoa { get; set; }

        public void Confirm() => TrangThai = TrangThaiLichHen.DA_XAC_NHAN;
        public void Cancel() => TrangThai = TrangThaiLichHen.DA_HUY;       
        public void MarkArrived() => TrangThai = TrangThaiLichHen.DA_DEN;   
        public void Complete() => TrangThai = TrangThaiLichHen.HOAN_THANH; 

    }
}