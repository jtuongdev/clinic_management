using ClinicManagement.Domain.Common.Enums;
using System;

namespace ClinicManagement.Application.DTOs.CoSo
{
    public class CoSoDto
    {
        public int Id { get; set; }
        public LoaiCoSo LoaiCoSo { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public int SoLuongKhoa { get; set; } 
        public DateTime? CreatedAt { get; set; }
    }
}
