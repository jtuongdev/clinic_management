using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Application.Features.Payroll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/payroll")]
    [ClinicalAuthorize("hr", HanhDongQuyen.XEM, PhamViDuLieu.TOAN_HE_THONG)]
public sealed class PayrollController(IMediator mediator) : BaseController
{
    [HttpGet("periods")]
    public async Task<IActionResult> List(CancellationToken ct) => Success(await mediator.Send(new GetPayrollPeriodsQuery(), ct));

    [HttpGet("my-payslips")]
    [AllowSelf]
    public async Task<IActionResult> MyPayslips(CancellationToken ct) =>
        Success(await mediator.Send(new LayBangLuongCaNhanQuery(CurrentUserId), ct));

    [HttpPost("periods")]
    public async Task<IActionResult> Create([FromBody] CreatePayrollPeriodRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new CreatePayrollPeriodCommand(request), ct), "Đã tạo kỳ lương.");

    [HttpGet("periods/{id:int}")]
    public async Task<IActionResult> Detail(int id, CancellationToken ct) =>
        Success(await mediator.Send(new GetPayrollPeriodQuery(id), ct));

    [HttpPost("periods/{id:int}/generate")]
    public async Task<IActionResult> Generate(int id, CancellationToken ct) =>
        Success(await mediator.Send(new GeneratePayrollCommand(id), ct), "Đã tạo bảng lương từ kỳ chấm công đã khóa.");

    [HttpPost("periods/{id:int}/approve")]
    public async Task<IActionResult> Approve(int id, CancellationToken ct) =>
        Success(await mediator.Send(new ApprovePayrollCommand(id), ct), "Đã duyệt kỳ lương.");

    [HttpPost("periods/{id:int}/close")]
    public async Task<IActionResult> Close(int id, CancellationToken ct) =>
        Success(await mediator.Send(new ClosePayrollCommand(id), ct), "Đã đóng kỳ lương.");

    [HttpPost("periods/{id:int}/pay")]
    public async Task<IActionResult> Pay(int id, CancellationToken ct) =>
        Success(await mediator.Send(new PayPayrollCommand(id), ct), "Đã đánh dấu thanh toán kỳ lương.");

    [HttpPost("bang-luong/{bangLuongId:int}/items")]
    public async Task<IActionResult> AddItem(int bangLuongId, [FromBody] AddItemRequest request, CancellationToken ct) =>
        Success(await mediator.Send(new ThemKhoanBangLuongCommand(bangLuongId, request), ct), "Đã thêm khoản điều chỉnh.");

    [HttpDelete("bang-luong/{bangLuongId:int}/items/{itemId:int}")]
    public async Task<IActionResult> RemoveItem(int bangLuongId, int itemId, CancellationToken ct) =>
        Success(await mediator.Send(new XoaKhoanBangLuongCommand(bangLuongId, itemId), ct), "Đã xóa khoản điều chỉnh.");

    [HttpPost("bang-luong/{bangLuongId:int}/recalculate")]
    public async Task<IActionResult> Recalculate(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new TinhLaiBangLuongNhanVienCommand(bangLuongId), ct), "Đã tính lại lương nhân viên.");

    [HttpGet("bang-luong/{bangLuongId:int}/attendance-drilldown")]
    public async Task<IActionResult> AttendanceDrilldown(int bangLuongId, CancellationToken ct) =>
        Success(await mediator.Send(new LayChiTietChamCongBangLuongQuery(bangLuongId), ct));
}
