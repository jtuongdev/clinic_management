using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class TienSuBenhRequest
    {
        public LoaiTienSu LoaiTienSu { get; set; }

        public string Ten { get; set; } = string.Empty;

        public string GhiChu { get; set; } = string.Empty;
    }
}