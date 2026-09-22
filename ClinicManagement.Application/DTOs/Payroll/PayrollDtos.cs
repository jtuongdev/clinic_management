namespace ClinicManagement.Application.DTOs.Payroll;

public record CreatePayrollPeriodRequest(int Thang, int Nam, DateTime TuNgay, DateTime DenNgay, int MaKyChamCong);

public record AddItemRequest(string LoaiKhoan, string TenKhoan, decimal SoTien, string? GhiChu = "");

public class ChiTietBangLuongDto
{
    public int Id { get; set; }
    public int MaBangLuong { get; set; }
    public string LoaiKhoan { get; set; } = "";
    public string TenKhoan { get; set; } = "";
    public decimal SoTien { get; set; }
    public string GhiChu { get; set; } = "";
}

public class PayrollSummaryKpiDto
{
    public decimal TongQuyLuong { get; set; }
    public decimal TongLuongCoBan { get; set; }
    public decimal TongLamThemOT { get; set; }
    public decimal TongBaoHiem { get; set; }
    public decimal TongThucLinh { get; set; }
    public decimal TongPhuCap { get; set; }
    public decimal TongKhauTru { get; set; }
    public int SoNhanVien { get; set; }
    public int SoNhanVienPhatSinhNo { get; set; }
    public decimal TongTienNoKyNay { get; set; }
}

public class AttendanceDrillDownItemDto
{
    public DateTime Ngay { get; set; }
    public string TenCa { get; set; } = "";
    public DateTime? GioVao { get; set; }
    public DateTime? GioRa { get; set; }
    public int PhutDiMuon { get; set; }
    public int PhutVeSom { get; set; }
    public double SoGioLamThucTe { get; set; }
    public double SoGioOT { get; set; }
    public string TrangThai { get; set; } = "";
    public string LoaiCong { get; set; } = "";
    public string GhiChu { get; set; } = "";
}

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
    public int SoNhanVienPhatSinhNo { get; set; }
    public decimal TongTienNoKyNay { get; set; }
    public PayrollSummaryKpiDto? Kpi { get; set; }
}

public sealed class PayrollLineDto
{
    public int Id { get; set; }
    public int MaKyLuong { get; set; }
    public int Thang { get; set; }
    public int Nam { get; set; }
    public string TrangThaiKyLuong { get; set; } = "";
    public int MaNhanVien { get; set; }
    public string TenNhanVien { get; set; } = "";
    public string TenKhoa { get; set; } = "";
    public string ChucDanh { get; set; } = "";
    public int? MaChucVu { get; set; }
    public decimal LuongCoBan { get; set; }
    public decimal SoNgayCong { get; set; }
    public decimal SoNgayNghiKhongLuong { get; set; }
    public decimal TongPhuCap { get; set; }
    public decimal TongKhauTru { get; set; }
    public decimal ThucLinh { get; set; }
    public decimal TienNoKyNay { get; set; }
    public decimal LuongTheoNgayCong { get; set; }
    public decimal KhauTruNghiKhongLuong { get; set; }
    public decimal TienTangCa { get; set; }
    public decimal KhauTruDiMuonVeSom { get; set; }
    public decimal TienBaoHiem { get; set; }
    public List<ChiTietBangLuongDto> ChiTiets { get; set; } = [];
}
