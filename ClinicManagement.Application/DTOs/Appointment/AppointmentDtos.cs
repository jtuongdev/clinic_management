using System;

namespace ClinicManagement.Application.DTOs.Appointment
{
    public class LichHenDto
    {
        public int Id { get; set; }
        public int MaBenhNhan { get; set; }
        public string TenBenhNhan { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string SoCCCD { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string GioiTinh { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;

        public int MaBacSi { get; set; }
        public string TenBacSi { get; set; } = string.Empty;
        public int? MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public string TenCoSo { get; set; } = string.Empty;

        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public string KhungGio => $"{ThoiGianBatDau:HH:mm} - {ThoiGianKetThuc:HH:mm}";
        public string NgayHen => ThoiGianBatDau.ToString("dd/MM/yyyy");

        public string TrangThai { get; set; } = string.Empty;
        public string TrangThaiText { get; set; } = string.Empty;
        public string LyDo { get; set; } = string.Empty;
        public string NguonDat { get; set; } = "LE_TAN";

        // Financial 100k Cash policy
        public decimal ChiPhiGiuCho { get; set; } = 100000m;
        public bool DaThanhToanGiuCho { get; set; }
        public string? SoPhieuThu { get; set; }
        public DateTime? NgayThanhToan { get; set; }
        public int? NguoiThuTien { get; set; }
        public string? TenNguoiThuTien { get; set; }
        public string? GhiChuHuy { get; set; }

        public int? MaLuotKham { get; set; }
        public int? SoThuTuHangDoi { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TimeSlotDto
    {
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public string Label => $"{ThoiGianBatDau:HH:mm} - {ThoiGianKetThuc:HH:mm}";
        public int SoLuongDaDat { get; set; }
        public int SoLuongToiDa { get; set; } = 2; // Giới hạn số lượng bệnh nhân tối đa mỗi slot
        public bool ConTrong => SoLuongDaDat < SoLuongToiDa;
    }

    public class ThongKeLichHenDto
    {
        public int TongLichHen { get; set; }
        public int ChoThuTien { get; set; }    // CHO_XAC_NHAN
        public int DaXacNhan { get; set; }     // DA_XAC_NHAN (Đã thu 100k tiền mặt)
        public int DaTiepNhan { get; set; }    // DA_DEN
        public int DaHuy { get; set; }          // DA_HUY
        public decimal TongTienDaThu { get; set; }
    }

    public class CreateLichHenRequest
    {
        public int MaBenhNhan { get; set; }
        public int MaBacSi { get; set; }
        public int MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public string LyDo { get; set; } = string.Empty;
        public string NguonDat { get; set; } = "LE_TAN";
    }

    public class TiepNhanLichHenResultDto
    {
        public int MaLichHen { get; set; }
        public int MaLuotKham { get; set; }
        public int SoThuTu { get; set; }
        public int MaHoaDon { get; set; }
        public string SoHoaDon { get; set; } = string.Empty;
        public decimal SoTienKhauTru { get; set; } = 100000m;
        public bool UuTienFastTrack { get; set; }
        public string ThongBao { get; set; } = string.Empty;
    }
}
