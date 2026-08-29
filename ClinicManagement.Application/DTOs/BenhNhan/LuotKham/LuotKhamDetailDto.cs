using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class LuotKhamDetailDto
    {
        public int Id { get; set; }
        public DateTime NgayKham { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string HinhThucDieuTri { get; set; } = string.Empty;
        public string LyDoKham { get; set; } = string.Empty;
        public string PhongKham { get; set; } = string.Empty;
        public DateTime? ThoiGianBatDauKham { get; set; }
        public DateTime? ThoiGianKetThucKham { get; set; }

        // Thông tin bác sĩ
        public string BacSi { get; set; } = string.Empty;
        public string ChuyenKhoaBacSi { get; set; } = string.Empty;

        // Thông tin khoa
        public string Khoa { get; set; } = string.Empty;

        // Danh sách chẩn đoán
        public List<ChanDoanDto> ChanDoans { get; set; } = new();

        // Sinh hiệu
        public SinhHieuDto? SinhHieu { get; set; }

        // Chỉ định dịch vụ
        public List<ChiDinhDichVuDto> ChiDinhDichVus { get; set; } = new();

        // Đơn thuốc
        public List<DonThuocDto> DonThuocs { get; set; } = new();
    }
}