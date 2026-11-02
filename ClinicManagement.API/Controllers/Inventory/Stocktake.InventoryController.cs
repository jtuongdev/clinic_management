using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Quản lý Kho Dược (Inventory) - Kiểm kê kho &amp; Cân bằng chênh lệch tồn (Stocktake).
/// Quản lý vòng đời đợt kiểm kê: lập phiếu kiểm kê, nhập số lượng thực tế, trình duyệt, phê duyệt và chốt điều chỉnh tồn kho.
/// </summary>
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    /// <summary>
    /// Khởi tạo một kỳ kiểm kê kho mới.
    /// </summary>
    [HttpPost("stocktakes")]
    public Task<IActionResult> CreateStocktake(StocktakeCreateRequest request) =>
        Send(new TaoKiemKeCommand(request, CurrentUserId));

    /// <summary>
    /// Ghi nhận kết quả kiểm đếm thực tế của từng mặt hàng trong đợt kiểm kê.
    /// </summary>
    [HttpPut("stocktakes/{id:int}/count")]
    public Task<IActionResult> CountStocktake(int id, StocktakeCountRequest request) =>
        Send(new GhiNhanKiemKeCommand(id, request, CurrentUserId));

    /// <summary>
    /// Trình duyệt biên bản kiểm kê lên cấp quản lý.
    /// </summary>
    [HttpPost("stocktakes/{id:int}/submit")]
    public Task<IActionResult> SubmitStocktake(int id) =>
        Send(new TrinhDuyetKiemKeCommand(id, CurrentUserId));

    /// <summary>
    /// Quản lý phê duyệt biên bản kiểm kê kho.
    /// </summary>
    [HttpPost("stocktakes/{id:int}/approve")]
    public Task<IActionResult> ApproveStocktake(int id, StocktakeCountsRequest request) =>
        Send(new DuyetKiemKeCommand(id, request, CurrentUserId));

    /// <summary>
    /// Chốt kiểm kê và tự động tạo bút toán điều chỉnh cân bằng tồn kho (thừa/thiếu).
    /// </summary>
    [HttpPost("stocktakes/{id:int}/finalize")]
    public Task<IActionResult> FinalizeStocktake(int id, StocktakeCountsRequest request) =>
        Send(new ChotKiemKeCommand(id, request, CurrentUserId));
}
