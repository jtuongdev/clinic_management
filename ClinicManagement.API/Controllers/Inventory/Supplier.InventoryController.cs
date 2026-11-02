using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Queries.DanhSachNhaCungCap;
using ClinicManagement.Application.Features.Kho.Commands.TaoNhaCungCap;
using ClinicManagement.Application.Features.Kho.Commands.CapNhatNhaCungCap;
using ClinicManagement.Application.Features.Kho.Commands.DoiTrangThaiNhaCungCap;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Quản lý Nhà cung cấp (Suppliers).
/// Quản lý thông tin các công ty dược phẩm, nhà phân phối vật tư y tế, lịch sử hợp tác và trạng thái hoạt động.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public partial class InventoryController
{
    /// <summary>
    /// Lấy danh sách nhà cung cấp có phân trang và bộ lọc theo từ khóa, trạng thái.
    /// </summary>
    [HttpGet("suppliers")]
    public Task<IActionResult> GetSuppliers([FromQuery] string? keyword, [FromQuery] TrangThaiNhaCungCap? status, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        => Send(new DanhSachNhaCungCapQuery(keyword, status, pageIndex, pageSize, CurrentUserId));

    /// <summary>
    /// Thêm mới nhà cung cấp thuốc / thiết bị y tế.
    /// </summary>
    [HttpPost("suppliers")]
    public Task<IActionResult> CreateSupplier([FromBody] NhaCungCapRequest request)
        => Send(new TaoNhaCungCapCommand(request, CurrentUserId));

    /// <summary>
    /// Cập nhật thông tin chi tiết nhà cung cấp.
    /// </summary>
    [HttpPut("suppliers/{id}")]
    public Task<IActionResult> UpdateSupplier(int id, [FromBody] NhaCungCapRequest request)
        => Send(new CapNhatNhaCungCapCommand(id, request, CurrentUserId));

    /// <summary>
    /// Thay đổi trạng thái hoạt động (Đang hợp tác / Ngừng hợp tác) của nhà cung cấp.
    /// </summary>
    [HttpPost("suppliers/{id}/toggle-status")]
    public Task<IActionResult> ToggleSupplierStatus(int id)
        => Send(new DoiTrangThaiNhaCungCapCommand(id, CurrentUserId));
}
