using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Nhật ký Giao dịch và Kiểm toán kho (Audit Log).
/// Theo dõi toàn bộ lịch sử biến động nhập, xuất, điều chuyển, hủy và kiểm kê từng mặt hàng.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Tra cứu nhật ký giao dịch kho (thẻ kho/sổ kho) theo mặt hàng và khoảng thời gian.
    /// </summary>
    [HttpGet("audit-transactions")]
    public Task<IActionResult> Audit(int? itemId, DateTime? fromDate, DateTime? toDate, int pageIndex = 1, int pageSize = 50) =>
        Send(new TraCuuGiaoDichKhoQuery(itemId, fromDate, toDate, pageIndex, pageSize, CurrentUserId));
}
