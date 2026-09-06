using ClinicManagement.API.Common;
using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Application.Features.Payroll;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/payroll")]
[Authorize(Roles = "Admin")]
public sealed class PayrollController(IMediator mediator) : BaseController
{
    [HttpGet("periods")]
    public async Task<IActionResult> List(CancellationToken ct) => Success(await mediator.Send(new GetPayrollPeriodsQuery(), ct));

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
}
