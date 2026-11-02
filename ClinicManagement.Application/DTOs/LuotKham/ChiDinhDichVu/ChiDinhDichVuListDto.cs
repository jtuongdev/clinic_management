using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class ChiDinhDichVuListDto
    {
        public int Id { get; set; } // Mã chỉ định DV
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public string TenBenhNhan { get; set; } = string.Empty;
        public string LoaiDichVu { get; set; } = string.Empty; // Lấy từ DanhMucDichVu.LoaiDichVu
        public string TenBacSiChiDinh { get; set; } = string.Empty;
        public string TenKhoa { get; set; } = string.Empty;
        public DateTime NgayChiDinh { get; set; }
        public string TrangThai { get; set; } = string.Empty; // Enum TrangThaiChiDinhDichVu
        public int MaBenhNhan { get; set; }
        public int MaKhoa { get; set; }
        public int MaBacSiChiDinh { get; set; }
        public int MaDanhMucDichVu { get; set; }
        public string TenDichVu { get; set; } = string.Empty; // Thêm tên dịch vụ
    }
}