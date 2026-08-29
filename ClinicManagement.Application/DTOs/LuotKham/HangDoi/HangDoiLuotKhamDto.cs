using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class HangDoiLuotKhamDto
    {
        public int Id { get; set; }
        public int MaBenhNhan { get; set; }
         public int? SoThuTu { get; private set; }
        public string TenBenhNhan { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;

    }
}