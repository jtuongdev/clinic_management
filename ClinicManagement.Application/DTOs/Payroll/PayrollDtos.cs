namespace ClinicManagement.Application.DTOs.Payroll;

public record CreatePayrollPeriodRequest(int Thang, int Nam, DateTime TuNgay, DateTime DenNgay, int MaKyChamCong);
public class PayrollPeriodDto
{
    public int Id { get; set; }
    public int Thang { get; set; }
    public int Nam { get; set; }
    public DateTime TuNgay { get; set; }
    public DateTime DenNgay { get; set; }
    public int? MaKyChamCong { get; set; }
    public string TrangThai { get; set; } = "";
    public int SoBangLuong { get; set; }
}
public sealed class PayrollDetailDto : PayrollPeriodDto
{
    public IReadOnlyList<PayrollLineDto> BangLuongs { get; set; } = [];
}
public sealed class PayrollLineDto
{
    public int Id { get; set; }
    public int MaNhanVien { get; set; }
    public string TenNhanVien { get; set; } = "";
    public decimal LuongCoBan { get; set; }
    public decimal SoNgayCong { get; set; }
    public decimal SoNgayNghiKhongLuong { get; set; }
    public decimal TongPhuCap { get; set; }
    public decimal TongKhauTru { get; set; }
    public decimal ThucLinh { get; set; }
    public decimal LuongTheoNgayCong { get; set; }
    public decimal KhauTruNghiKhongLuong { get; set; }
    public decimal TienTangCa { get; set; }
    public decimal KhauTruDiMuonVeSom { get; set; }
    public decimal TienBaoHiem { get; set; }
}
