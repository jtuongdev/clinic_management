using System.Collections.Generic;
using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries.LayDanhSachNhanVienLookup;

/// <summary>
/// Query lấy danh sách rút gọn nhân viên cho dropdown / lookup / filters.
/// </summary>
public class LayDanhSachNhanVienLookupQuery : IRequest<IReadOnlyList<NhanVienLookupDto>>
{
    /// <summary>
    /// Lọc theo mã khoa phòng
    /// </summary>
    public int? MaKhoa { get; set; }

    /// <summary>
    /// Lọc theo tên chức vụ (ví dụ: "Bác sĩ", "Điều dưỡng", "Dược sĩ",...)
    /// </summary>
    public string? ChucVu { get; set; }

    /// <summary>
    /// Lọc theo mã chức vụ
    /// </summary>
    public int? MaChucVu { get; set; }

    /// <summary>
    /// Lọc theo mã cơ sở phòng khám
    /// </summary>
    public int? MaCoSo { get; set; }

    /// <summary>
    /// Từ khóa tìm kiếm nhanh (theo họ tên, mã nhân viên, số điện thoại)
    /// </summary>
    public string? Keyword { get; set; }

    /// <summary>
    /// Lọc theo trạng thái hoạt động (mặc định true: chỉ lấy nhân viên đang hoạt động)
    /// </summary>
    public bool? IsActive { get; set; } = true;
}
