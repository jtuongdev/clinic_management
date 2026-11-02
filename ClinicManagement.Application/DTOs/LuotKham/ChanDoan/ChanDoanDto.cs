using System;

namespace ClinicManagement.Application.DTOs.LuotKham.ChanDoan
{
    public class ChanDoanDto
    {
        public int Id { get; set; }
        public string MaICD { get; set; } = string.Empty;
        public string TenICD { get; set; } = string.Empty;
        public string TenChanDoan { get; set; } = string.Empty;
        public bool LaChanDoanChinh { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class ICDOptionDto
    {
        public string MaICD { get; set; } = string.Empty;
        public string TenICD { get; set; } = string.Empty;
        public string Chuong { get; set; } = string.Empty;

        // Aliases to guarantee compatibility across all frontend components and queries
        public string Ma => MaICD;
        public string Code => MaICD;
        public string Ten => TenICD;
        public string Name => TenICD;
        public string TenChanDoan => TenICD;
    }
}
