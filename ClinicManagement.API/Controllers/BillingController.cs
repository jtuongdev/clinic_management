using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Application.Features.Billing;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[ClinicalAuthorize("billing", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
[Route("api/billing")]
public sealed class BillingController(IMediator mediator) : BaseController
{
    [HttpGet("invoices")]
    public async Task<IActionResult> GetInvoices(
        [FromQuery] int facilityId = 0,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] TrangThaiHoaDon? status = null,
        [FromQuery] string? keyword = null,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayDanhSachHoaDonQuery(facilityId, fromDate, toDate, status, keyword, pageIndex, pageSize),
            cancellationToken));

    [HttpGet("invoices/{id:int}")]
    public async Task<IActionResult> GetInvoice(int id, CancellationToken cancellationToken)
    {
        var invoice = await mediator.Send(new LayHoaDonTheoIdQuery(id), cancellationToken);
        return invoice is null ? Failure("Không tìm thấy hóa đơn.", 404) : Success(invoice);
    }

    [HttpGet("invoices/by-visit/{visitId:int}")]
    public async Task<IActionResult> GetInvoiceByVisit(int visitId, CancellationToken cancellationToken)
    {
        var invoice = await mediator.Send(new LayHoaDonTheoLuotKhamQuery(visitId), cancellationToken);
        return invoice is null ? Failure("Lượt khám chưa có hóa đơn.", 404) : Success(invoice);
    }

    [HttpGet("invoices/{id:int}/payments")]
    public async Task<IActionResult> GetPayments(int id, CancellationToken cancellationToken)
        => Success(await mediator.Send(new LayDanhSachPhieuThuQuery(id), cancellationToken));

    [HttpPost("invoices/{id:int}/payments")]
    [ClinicalAuthorize("billing", HanhDongQuyen.TAO, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> RecordPayment(
        int id, [FromBody] RecordPaymentRequest request, CancellationToken cancellationToken)
        => Success(await mediator.Send(
            new ThanhToanHoaDonCommand(id, request, CurrentUserId), cancellationToken),
            "Ghi nhận thanh toán thành công");

    [HttpPost("invoices/{id:int}/insurance")]
    [ClinicalAuthorize("billing", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> ApplyInsurance(
        int id, [FromBody] ApplyInsuranceRequest request, CancellationToken cancellationToken)
        => Success(await mediator.Send(
            new ApDungBaoHiemHoaDonCommand(id, request, CurrentUserId), cancellationToken),
            "Áp dụng bảo hiểm thành công");

    [HttpPost("invoices/{id:int}/cancel")]
    [ClinicalAuthorize("billing", HanhDongQuyen.XOA, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> Cancel(
        int id, [FromBody] CancelInvoiceRequest request, CancellationToken cancellationToken)
        => Success(await mediator.Send(
            new HuyHoaDonCommand(id, request, CurrentUserId), cancellationToken),
            "Hủy hóa đơn thành công");

    [HttpGet("debts/by-patient/{patientId:int}")]
    public async Task<IActionResult> GetPatientDebts(int patientId, CancellationToken cancellationToken)
        => Success(await mediator.Send(new LayCongNoBenhNhanQuery(patientId), cancellationToken));

    [HttpGet("debts/overdue")]
    public async Task<IActionResult> GetOverdueDebts(
        [FromQuery] int facilityId = 0, CancellationToken cancellationToken = default)
        => Success(await mediator.Send(new LayCongNoQuaHanQuery(facilityId), cancellationToken));
}
