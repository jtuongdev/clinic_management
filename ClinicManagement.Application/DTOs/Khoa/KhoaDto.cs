using System;

namespace ClinicManagement.Application.DTOs.Khoa
{
    public class KhoaDto
    {
        public int Id { get; set; }
        public int MaCoSo { get; set; }
        public int? MaKhoaCha { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string? TenCoSo { get; set; }   
        public string? TenKhoaCha { get; set; }  
        public int SoLuongKhoaCon { get; set; }  
        public int SoLuongNhanVien { get; set; } 
        public DateTime? CreatedAt { get; set; }
    }
}
