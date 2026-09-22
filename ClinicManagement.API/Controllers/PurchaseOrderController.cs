using ClinicManagement.API.Authorization;
using ClinicManagement.API.Common;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Commands.TaoPhieuNhapTuPO;
using ClinicManagement.Application.Features.Kho.Queries.PurchaseOrders;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/purchase-orders")]
[Route("api/inventory/purchase-orders")]
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed class PurchaseOrderController(IMediator mediator, ILogger<PurchaseOrderController> logger) : BaseController
{
    /// <summary>
    /// Lấy danh sách đơn đặt hàng đang chờ giao (DA_DAT, GIAO_MOT_PHAN)
    /// </summary>
    [HttpGet("active-pending")]
    public async Task<IActionResult> GetActivePending(
        [FromQuery] int? maNhaCungCap,
        [FromQuery] int? supplierId)
    {
        var targetSupplierId = supplierId ?? maNhaCungCap;
        var result = await mediator.Send(new DanhSachDonDatHangChoQuery(targetSupplierId, CurrentUserId));
        if (!result.IsSuccess)
            return Failure(result.Message!, result.StatusCode);
        return Success(result.Data);
    }

    /// <summary>
    /// Lấy chi tiết đơn đặt hàng phục vụ việc đối soát và nạp vào phiếu nhập kho
    /// </summary>
    [HttpGet("{id:int}/for-import")]
    public async Task<IActionResult> GetForImport(int id)
    {
        var result = await mediator.Send(new ChiTietDonDatHangChoNhapQuery(id, CurrentUserId));
        if (!result.IsSuccess)
            return Failure(result.Message!, result.StatusCode);
        return Success(result.Data);
    }

    /// <summary>
    /// Tạo phiếu nhập kho liên kết từ đơn đặt hàng PO
    /// </summary>
    [HttpPost("import-receipt")]
    public async Task<IActionResult> CreateImportReceipt(CreateImportFromPoRequest request)
    {
        var result = await mediator.Send(new TaoPhieuNhapTuPOCommand(request, CurrentUserId));
        if (!result.IsSuccess)
            return Failure(result.Message!, result.StatusCode);
        return Success(result.Data);
    }
}
