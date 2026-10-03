using System;
using ClinicManagement.Application.DTOs.ThongKe;
using MediatR;

namespace ClinicManagement.Application.Features.ThongKe.Queries.LayBaoCaoLamSang;

/// <summary>
/// Query lấy dữ liệu Báo cáo & Thống kê Lâm sàng theo bộ lọc phạm vi.
/// </summary>
public class LayBaoCaoLamSangQuery : IRequest<BaoCaoLamSangDto>
{
    /// <summary>
    /// Mã cơ sở phòng khám (tùy chọn - nếu null: toàn hệ thống)
    /// </summary>
    public int? FacilityId { get; set; }

    /// <summary>
    /// Mã khoa phòng (tùy chọn - nếu null: tất cả khoa)
    /// </summary>
    public int? DepartmentId { get; set; }

    /// <summary>
    /// Từ ngày (mặc định đầu tháng hiện tại nếu không chọn)
    /// </summary>
    public DateTime? FromDate { get; set; }

    /// <summary>
    /// Đến ngày (mặc định cuối ngày hôm nay nếu không chọn)
    /// </summary>
    public DateTime? ToDate { get; set; }

    /// <summary>
    /// Ca trực: "shift_all", "shift_morning", "shift_evening"
    /// </summary>
    public string? Shift { get; set; }
}
