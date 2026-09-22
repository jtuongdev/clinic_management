namespace ClinicManagement.Domain.Identity
{
    public class BacSiKhoaModel
    {
        public NhanVien NhanVien { get; set; } = null!;
        public bool DangTruc { get; set; }
        public int? MaPhongKhamMacDinh { get; set; }
        public string? TenPhongKhamMacDinh { get; set; }
    }
}
