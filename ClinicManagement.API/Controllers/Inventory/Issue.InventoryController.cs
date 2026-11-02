using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Xuất kho &amp; Biến động giảm tồn (Stock Issue).
/// Bao gồm: xuất vật tư tiêu hao thủ thuật, xuất sử dụng nội bộ, xuất trả hàng cho nhà cung cấp và xuất hủy hàng hỏng/hết hạn.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Lấy danh sách phiếu xuất vật tư tiêu hao phục vụ thủ thuật y tế.
    /// </summary>
    [HttpGet("exports/procedure-supplies")]
    public Task<IActionResult> GetProcedureSuppliesExports(
        [FromQuery] int? khoId = null,
        [FromQuery] string? loaiXuat = null,
        [FromQuery] string? keyword = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 10) =>
        Send(new ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatVatTu.LayDanhSachPhieuXuatVatTuQuery(
            khoId, loaiXuat, keyword, fromDate, toDate, pageIndex, pageSize, CurrentUserId));

    /// <summary>
    /// Tạo phiếu xuất vật tư sử dụng nội bộ cho phòng ban / cơ sở.
    /// </summary>
    [HttpPost("exports/internal-use")]
    public Task<IActionResult> InternalUse(ExportRequest request) =>
        Send(new XuatNoiBoCommand(request, CurrentUserId));

    /// <summary>
    /// Tạo phiếu xuất trả hàng về nhà cung cấp (hàng lỗi, cận date).
    /// </summary>
    [HttpPost("returns")]
    public Task<IActionResult> ReturnToSupplier(StockMutationRequest request) =>
        Send(new TraNhaCungCapCommand(request, CurrentUserId));

    /// <summary>
    /// Tạo phiếu xuất hủy hàng tồn kho (hết hạn sử dụng, bể vỡ, hỏng hóc).
    /// </summary>
    [HttpPost("write-offs")]
    public Task<IActionResult> WriteOff(StockMutationRequest request) =>
        Send(new HuyTonCommand(request, CurrentUserId));
}
