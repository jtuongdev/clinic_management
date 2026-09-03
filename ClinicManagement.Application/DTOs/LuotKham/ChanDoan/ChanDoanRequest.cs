namespace ClinicManagement.Application.DTOs.LuotKham.ChanDoan
{
    public class ChanDoanRequest
    {
        public int? Id { get; set; }
        public string MaICD { get; set; } = string.Empty;
        public string TenChanDoan { get; set; } = string.Empty;
        public bool LaChanDoanChinh { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }
}
