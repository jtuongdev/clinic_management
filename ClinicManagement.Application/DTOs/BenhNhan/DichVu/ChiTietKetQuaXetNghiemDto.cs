namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class ChiTietKetQuaXetNghiemDto
    {
        public string TenChiSo { get; set; } = string.Empty;
        public string GiaTri { get; set; } = string.Empty;
        public string DonVi { get; set; } = string.Empty;
        public string KhoangThamChieu { get; set; } = string.Empty;
        public bool? BatThuong { get; set; }
    }
}