using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.LuotKham.Examination
{
    public class ExaminationDetailResponseDto
    {
        public string LyDoKham { get; set; } = string.Empty;
        public string? GhiChuTienSu { get; set; }
        public List<TienSuBenhDto>? TienSuBenhs { get; set; }
        public SinhHieuDto? SinhHieu { get; set; }
    }

    public class TienSuBenhDto
    {
        public int? Id { get; set; }
        public int LoaiTienSu { get; set; } // 1: Bệnh nền, 2: Tiền sử, ...
        public string Ten { get; set; } = string.Empty;
        public string? GhiChu { get; set; }
    }


    public class SinhHieuDto
    {
        public int? Id { get; set; }
        public DateTime ThoiDiemDo { get; set; }
        public int? HuyetApTamThu { get; set; }
        public int? HuyetApTamTruong { get; set; }
        public int? Mach { get; set; }
        public decimal? NhietDo { get; set; }
        public decimal? CanNang { get; set; }
        public decimal? ChieuCao { get; set; }
        public decimal? SpO2 { get; set; }
    }
}