using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Features.Kho.Lenh;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController
{
    [HttpPost("stocktakes")]
    public Task<IActionResult> CreateStocktake(StocktakeCreateRequest request) =>
        Send(new TaoKiemKeCommand(request, CurrentUserId));

    [HttpPut("stocktakes/{id:int}/count")]
    public Task<IActionResult> CountStocktake(int id, StocktakeCountRequest request) =>
        Send(new GhiNhanKiemKeCommand(id, request, CurrentUserId));

    [HttpPost("stocktakes/{id:int}/submit")]
    public Task<IActionResult> SubmitStocktake(int id) =>
        Send(new TrinhDuyetKiemKeCommand(id, CurrentUserId));

    [HttpPost("stocktakes/{id:int}/approve")]
    public Task<IActionResult> ApproveStocktake(int id, StocktakeCountsRequest request) =>
        Send(new DuyetKiemKeCommand(id, request, CurrentUserId));

    [HttpPost("stocktakes/{id:int}/finalize")]
    public Task<IActionResult> FinalizeStocktake(int id, StocktakeCountsRequest request) =>
        Send(new ChotKiemKeCommand(id, request, CurrentUserId));
}
