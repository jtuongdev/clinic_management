using System;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Domain.Appointment
{
    public class LichHen : BaseEntity, IAggregateRoot
    {
        public int MaBenhNhan { get; set; }
        public int MaBacSi { get; set; }
        public int MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public TrangThaiLichHen TrangThai { get; set; }
        public string LyDo { get; set; } = string.Empty;
        public string NguonDat { get; set; } = "LE_TAN";  // APP, WEB, CALL_CENTER, LE_TAN
        public int? CreatedBy { get; set; }

        // Financial & Reservation attributes
        public decimal ChiPhiGiuCho { get; set; } = 100000m;
        public bool DaThanhToanGiuCho { get; set; } = false;
        public string? SoPhieuThu { get; set; }
        public DateTime? NgayThanhToan { get; set; }
        public int? NguoiThuTien { get; set; }
        public string? GhiChuHuy { get; set; }

        // Navigation
        public virtual BenhNhan BenhNhan { get; set; } = null!;
        public virtual NhanVien BacSi { get; set; } = null!;
        public virtual CoSo CoSo { get; set; } = null!;
        public virtual Khoa? Khoa { get; set; }

        public LichHen()
        {
            ChiPhiGiuCho = 100000m;
            TrangThai = TrangThaiLichHen.CHO_XAC_NHAN;
        }

        public LichHen(
            int maBenhNhan,
            int maBacSi,
            int maCoSo,
            int? maKhoa,
            DateTime thoiGianBatDau,
            DateTime thoiGianKetThuc,
            string lyDo,
            string nguonDat = "LE_TAN",
            int? createdBy = null)
        {
            MaBenhNhan = maBenhNhan;
            MaBacSi = maBacSi;
            MaCoSo = maCoSo;
            MaKhoa = maKhoa;
            ThoiGianBatDau = thoiGianBatDau;
            ThoiGianKetThuc = thoiGianKetThuc;
            LyDo = lyDo ?? string.Empty;
            NguonDat = nguonDat;
            CreatedBy = createdBy;

            ChiPhiGiuCho = 100000m;
            DaThanhToanGiuCho = false;
            TrangThai = TrangThaiLichHen.CHO_XAC_NHAN;
        }

        public void XacNhanThuTienMat(string soPhieuThu, int nguoiThu)
        {
            if (TrangThai == TrangThaiLichHen.DA_HUY)
                throw new InvalidOperationException("Không thể thu tiền cho lịch hẹn đã bị hủy.");

            DaThanhToanGiuCho = true;
            SoPhieuThu = soPhieuThu;
            NgayThanhToan = DateTime.UtcNow;
            NguoiThuTien = nguoiThu;
            TrangThai = TrangThaiLichHen.DA_XAC_NHAN;
        }

        public void HuyLichHen(string lyDo)
        {
            if (TrangThai == TrangThaiLichHen.DA_DEN || TrangThai == TrangThaiLichHen.HOAN_THANH)
                throw new InvalidOperationException("Không thể hủy lịch hẹn đã tiếp nhận hoặc đã hoàn thành khám.");

            TrangThai = TrangThaiLichHen.DA_HUY;
            GhiChuHuy = lyDo;
            // CHÍNH SÁCH PHÒNG KHÁM: Khoản phí giữ chỗ 100.000 VNĐ KHÔNG HOÀN LẠI
            // Tuyệt đối không sinh phiếu chi hoàn tiền mặt.
        }

        public void TiepNhanVaoKham()
        {
            if (TrangThai == TrangThaiLichHen.DA_HUY)
                throw new InvalidOperationException("Không thể tiếp nhận lịch hẹn đã bị hủy.");

            TrangThai = TrangThaiLichHen.DA_DEN;
        }

        public void Confirm() => TrangThai = TrangThaiLichHen.DA_XAC_NHAN;
        public void Cancel() => TrangThai = TrangThaiLichHen.DA_HUY;       
        public void MarkArrived() => TrangThai = TrangThaiLichHen.DA_DEN;   
        public void Complete() => TrangThai = TrangThaiLichHen.HOAN_THANH; 
    }
}