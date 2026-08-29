using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.LuotKham.Examination
{
    public class ExaminationResultDto
    {
        public int Id { get; set; }
        public int MaBenhNhan { get; set; }
        public string TenBenhNhan { get; set; } = string.Empty;
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public int? MaBacSi { get; set; }
        public string TenBacSi { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public string Phong { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayKham { get; set; }
        public DateTime? ThoiGianBatDauKham { get; set; }
        public string LyDoKham { get; set; } = string.Empty;
        public string GhiChuTienSu { get; set; } = string.Empty;

        /// <summary>
        /// Sinh hiệu mới nhất đã lưu
        /// </summary>
        public SinhHieuResultDto? SinhHieu { get; set; }

        /// <summary>
        /// Danh sách tiền sử bệnh của bệnh nhân
        /// </summary>
        public List<TienSuBenhResultDto> TienSuBenhs { get; set; } = new();

        /// <summary>
        /// Danh sách chẩn đoán đã lưu
        /// </summary>
        public List<ChanDoanResultDto> ChanDoans { get; set; } = new();
    }

    public class SinhHieuResultDto
    {
        public int Id { get; set; }
        public decimal? NhietDo { get; set; }
        public int? Mach { get; set; }
        public int? HuyetApTamThu { get; set; }
        public int? HuyetApTamTruong { get; set; }
        public decimal? SpO2 { get; set; }
        public decimal? CanNang { get; set; }
        public decimal? ChieuCao { get; set; }
        public DateTime ThoiDiemDo { get; set; }
    }

    public class ChanDoanResultDto
    {
        public int Id { get; set; }
        public string MaICD { get; set; } = string.Empty;
        public string TenChanDoan { get; set; } = string.Empty;
        public bool LaChanDoanChinh { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class TienSuBenhResultDto
    {
        public int Id { get; set; }
        public string LoaiTienSu { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
    }
}
