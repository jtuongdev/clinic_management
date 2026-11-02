using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Tra cứu Tồn kho &amp; Cảnh báo dược phẩm (Stock &amp; Alerts).
/// Cung cấp thông tin tồn kho tức thời theo kho, phát hiện mặt hàng chạm ngưỡng tồn tối thiểu và cảnh báo hạn sử dụng.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Tra cứu tồn kho theo kho, từ khóa, mặt hàng sắp hết hoặc trạng thái tồn.
    /// </summary>
    [HttpGet("stock")]
    public Task<IActionResult> Stock(
        string? keyword,
        bool lowStockOnly = false,
        string? stockStatus = null,
        int? warehouseId = null,
        int pageIndex = 1,
        int pageSize = 20) =>
        Send(new LayTonKhoQuery(keyword, lowStockOnly, pageIndex, pageSize, CurrentUserId, warehouseId, stockStatus));

    /// <summary>
    /// Lấy danh sách cảnh báo tồn kho: thuốc cận hạn sử dụng trong N ngày hoặc dưới định mức tồn an toàn.
    /// </summary>
    [HttpGet("stock/alerts")]
    public Task<IActionResult> Alerts(int expiringWithinDays = 60) =>
        Send(new LayCanhBaoKhoQuery(expiringWithinDays, CurrentUserId));
}
