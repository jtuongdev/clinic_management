namespace ClinicManagement.Application.DTOs.NhanVien;

/// <summary>
/// DTO danh sách nhân viên rút gọn (Lookup / Dropdown list) dùng chung cho các bộ lọc,
/// phân công bác sĩ, xếp hạng hiệu suất và các tab nghiệp vụ.
/// </summary>
public class NhanVienLookupDto
{
    /// <summary>
    /// ID nhân viên (Primary Key)
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Mã nhân viên (Username đăng nhập)
    /// </summary>
    public string MaNhanVien { get; set; } = string.Empty;

    /// <summary>
    /// Họ và tên nhân viên
    /// </summary>
    public string HoTen { get; set; } = string.Empty;

    /// <summary>
    /// Tên chức vụ hoặc chuyên khoa chuyên môn
    /// </summary>
    public string ChucVu { get; set; } = string.Empty;

    /// <summary>
    /// Vai trò hệ thống được gán (nếu có)
    /// </summary>
    public string? VaiTro { get; set; }

    /// <summary>
    /// Mã khoa phòng làm việc chính
    /// </summary>
    public int? MaKhoa { get; set; }

    /// <summary>
    /// Tên khoa phòng làm việc chính
    /// </summary>
    public string? TenKhoa { get; set; }

    /// <summary>
    /// Trạng thái hoạt động
    /// </summary>
    public bool TrangThaiHoatDong { get; set; }

    /// <summary>
    /// Alias tương thích frontend
    /// </summary>
    public bool IsActive => TrangThaiHoatDong;
}
