namespace ClinicManagement.Application.DTOs.PatientBooking
{
    public class BookingDoctorDto
    {
        public int Id { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? ChuyenKhoa { get; set; }
        public string? HocHamHocVi { get; set; }
        public string SoHanhNghe { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public int? MaKhoa { get; set; }
        public string? TenKhoa { get; set; }
        public int? MaCoSo { get; set; }
        public string? TenCoSo { get; set; }
        public bool DangTruc { get; set; }
        public string? AvatarUrl { get; set; }
        public string? MoTa { get; set; }
    }
}
