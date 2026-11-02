using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Danh mục Mặt hàng Thuốc &amp; Vật tư y tế.
/// Cung cấp các thao tác tra cứu danh mục, thêm mới, hiệu chỉnh thông tin và kích hoạt/vô hiệu hóa mặt hàng.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Lấy danh sách mặt hàng thuốc/vật tư có phân trang và bộ lọc theo loại hàng, trạng thái.
    /// </summary>
    [HttpGet("items")]
    public Task<IActionResult> Items(string? keyword, LoaiItem? itemType, bool? isActive, int pageIndex = 1, int pageSize = 20) =>
        Send(new LayDanhSachMatHangQuery(keyword, itemType, isActive, pageIndex, pageSize, CurrentUserId));

    /// <summary>
    /// Thêm mới một mặt hàng thuốc hoặc vật tư y tế vào danh mục kho.
    /// </summary>
    [HttpPost("items")]
    public Task<IActionResult> CreateItem(ItemRequest request) =>
        Send(new TaoMatHangCommand(request, CurrentUserId));

    /// <summary>
    /// Cập nhật thông tin chi tiết của mặt hàng thuốc/vật tư.
    /// </summary>
    [HttpPut("items/{id:int}")]
    public Task<IActionResult> UpdateItem(int id, ItemRequest request) =>
        Send(new CapNhatMatHangCommand(id, request, CurrentUserId));

    /// <summary>
    /// Bật/Tắt trạng thái hoạt động (Active/Inactive) của mặt hàng.
    /// </summary>
    [HttpPost("items/{id:int}/toggle-status")]
    public Task<IActionResult> ToggleItem(int id) =>
        Send(new DoiTrangThaiMatHangCommand(id, CurrentUserId));
}
