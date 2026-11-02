using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using System;

namespace ClinicManagement.Domain.Identity
{
    public class ChamCong : BaseEntity
    {
        public int MaNhanVien { get; set; }
        public int? MaLichLamViec { get; set; }
        public DateTime NgayChamCong { get; set; }
        public DateTime? CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public double GioLamThucTe { get; private set; }
        public int PhutDiMuon { get; private set; }
        public int PhutVeSom { get; private set; }
        public TrangThaiChamCong TrangThai { get; private set; } = TrangThaiChamCong.CHUA_CHAM_CONG;
        public LoaiNghiPhep? LoaiNghi { get; private set; }
        public string GhiChu { get; set; } = string.Empty;

        public virtual NhanVien NhanVien { get; set; } = null!;
        public virtual LichLamViec? LichLamViec { get; set; }

        public void CheckInAt(DateTime time, DateTime scheduledStart)
        {
            if (CheckIn.HasValue) throw new InvalidOperationException("Nhân viên đã check-in.");
            CheckIn = time;
            PhutDiMuon = time > scheduledStart ? Math.Max(0, (int)(time - scheduledStart).TotalMinutes) : 0;
            // A check-in without a check-out is explicitly incomplete.
            TrangThai = TrangThaiChamCong.THIEU_CHECK_OUT;
        }

        public void CheckOutAt(DateTime time, DateTime scheduledEnd)
        {
            if (!CheckIn.HasValue) throw new InvalidOperationException("Phải check-in trước khi check-out.");
            if (CheckOut.HasValue) throw new InvalidOperationException("Nhân viên đã check-out.");
            if (time < CheckIn.Value) throw new InvalidOperationException("Thời gian check-out không hợp lệ.");
            CheckOut = time;
            GioLamThucTe = Math.Round((time - CheckIn.Value).TotalHours, 2);
            PhutVeSom = time < scheduledEnd ? Math.Max(0, (int)(scheduledEnd - time).TotalMinutes) : 0;
            TrangThai = (PhutDiMuon > 0, PhutVeSom > 0) switch
            {
                (true, true) => TrangThaiChamCong.DI_MUON_VE_SOM,
                (true, false) => TrangThaiChamCong.DI_MUON,
                (false, true) => TrangThaiChamCong.VE_SOM,
                _ => TrangThaiChamCong.DI_DUNG_GIO
            };
        }

        public void ApplyAdjustment(DateTime? checkIn, DateTime? checkOut, DateTime scheduledStart, DateTime scheduledEnd)
        {
            if (checkIn.HasValue && checkOut.HasValue && checkOut < checkIn) throw new InvalidOperationException("Thời gian điều chỉnh không hợp lệ.");
            if (!checkIn.HasValue && checkOut.HasValue) throw new InvalidOperationException("Phải có check-in khi điều chỉnh check-out.");
            CheckIn = checkIn; CheckOut = checkOut;
            PhutDiMuon = checkIn.HasValue && checkIn > scheduledStart ? Math.Max(0, (int)(checkIn.Value - scheduledStart).TotalMinutes) : 0;
            PhutVeSom = checkOut.HasValue && checkOut < scheduledEnd ? Math.Max(0, (int)(scheduledEnd - checkOut.Value).TotalMinutes) : 0;
            GioLamThucTe = checkIn.HasValue && checkOut.HasValue ? Math.Round((checkOut.Value - checkIn.Value).TotalHours, 2) : 0;
            TrangThai = !checkIn.HasValue ? TrangThaiChamCong.CHUA_CHAM_CONG :
                !checkOut.HasValue ? TrangThaiChamCong.THIEU_CHECK_OUT :
                (PhutDiMuon > 0, PhutVeSom > 0) switch {
                    (true, true) => TrangThaiChamCong.DI_MUON_VE_SOM,
                    (true, false) => TrangThaiChamCong.DI_MUON,
                    (false, true) => TrangThaiChamCong.VE_SOM,
                    _ => TrangThaiChamCong.DI_DUNG_GIO
                };
        }

        public void MarkLeave(LoaiNghiPhep loaiNghi = LoaiNghiPhep.PHEP_NAM)
        {
            if (CheckIn.HasValue) throw new InvalidOperationException("Không thể ghi nghỉ sau khi đã check-in.");
            LoaiNghi = loaiNghi;
            TrangThai = TrangThaiChamCong.NGHI_PHEP;
        }

        public void MarkAbsent()
        {
            if (CheckIn.HasValue) throw new InvalidOperationException("Không thể ghi vắng sau khi đã check-in.");
            TrangThai = TrangThaiChamCong.VANG_MAT;
        }
    }
}