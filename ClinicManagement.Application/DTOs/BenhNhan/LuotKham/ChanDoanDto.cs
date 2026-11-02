// Application/DTOs/BenhNhan/ChanDoanDto.cs
namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class ChanDoanDto
    {
        public int Id { get; set; }
        public string MaICD { get; set; } = string.Empty;
        public string TenICD { get; set; } = string.Empty;
        public string TenChanDoan { get; set; } = string.Empty;
        public bool LaChanDoanChinh { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }
}