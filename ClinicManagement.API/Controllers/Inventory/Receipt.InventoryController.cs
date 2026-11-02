using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using ClinicManagement.Application.Features.Kho.Queries.DanhSachPhieuNhap;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Nhập kho hàng hóa &amp; Dược phẩm (Stock Receipt).
/// Cung cấp các chức năng quản lý danh sách phiếu nhập, lập phiếu nhập mới, nhập kho từ PO,
/// phê duyệt phiếu nhập (tăng tồn kho), chỉnh sửa và hủy phiếu nhập.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Lấy danh sách phiếu nhập kho có phân trang và bộ lọc (từ khóa, trạng thái, thời gian).
    /// </summary>
    [HttpGet("import-receipts")]
    public Task<IActionResult> GetImportReceipts(
        [FromQuery] string? keyword,
        [FromQuery] TrangThaiPhieuNhap? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20) =>
        Send(new DanhSachPhieuNhapQuery(
            keyword, status, fromDate, toDate, pageIndex, pageSize, CurrentUserId));

    /// <summary>
    /// Lập phiếu nhập kho hàng hóa/thuốc mới (ở trạng thái chờ duyệt).
    /// </summary>
    [HttpPost("import-receipts")]
    public Task<IActionResult> Import(ImportRequest request) =>
        Send(new TaoPhieuNhapCommand(request, CurrentUserId));

    /// <summary>
    /// Lập phiếu nhập kho liên kết trực tiếp từ đơn đặt hàng nhà cung cấp (Purchase Order).
    /// </summary>
    [HttpPost("import-receipts/from-po")]
    [HttpPost("/api/kho/nhap-kho/from-po")]
    public Task<IActionResult> ImportFromPo(CreateImportFromPoRequest request) =>
        Send(new ClinicManagement.Application.Features.Kho.Commands.TaoPhieuNhapTuPO.TaoPhieuNhapTuPOCommand(request, CurrentUserId));

    /// <summary>
    /// Phê duyệt phiếu nhập kho (chính thức tăng số lượng tồn kho và ghi nhận giá vốn).
    /// </summary>
    [HttpPost("import-receipts/{id:int}/approve")]
    public Task<IActionResult> ApproveImport(int id) =>
        Send(new DuyetPhieuNhapCommand(id, CurrentUserId));

    /// <summary>
    /// Cập nhật thông tin phiếu nhập kho khi chưa phê duyệt.
    /// </summary>
    [HttpPut("import-receipts/{id:int}")]
    public Task<IActionResult> UpdateImport(int id, ImportRequest request) =>
        Send(new CapNhatPhieuNhapCommand(id, request, CurrentUserId));

    /// <summary>
    /// Hủy bỏ phiếu nhập kho chưa phê duyệt kèm lý do hủy.
    /// </summary>
    [HttpPost("import-receipts/{id:int}/cancel")]
    public Task<IActionResult> CancelImport(int id, [FromBody] CancelImportRequest? request) =>
        Send(new HuyPhieuNhapCommand(id, request?.Reason, CurrentUserId));
}
