using ClinicManagement.API.Authorization;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Application.Features.Billing;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Viện phí & Tài chính (Billing) - Quản lý Hóa đơn, Thanh toán, Bảo hiểm & Công nợ
/// Route: api/billing
/// Quyền: billing (XEM/TAO/SUA/XOA, CO_SO)
/// </summary>
[ApiController]
[ClinicalAuthorize("billing", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
[Route("api/billing")]
public sealed class BillingController(IMediator mediator, IConfiguration config) : BaseController
{
    /// <summary>
    /// Lấy danh sách hóa đơn viện phí có phân trang và bộ lọc
    /// </summary>
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

    /// <summary>
    /// Tạo thông tin và mã QR thanh toán chuẩn VietQR cho hóa đơn viện phí
    /// </summary>
    [HttpGet("invoices/{id:int}/vietqr")]
    public async Task<IActionResult> GetInvoiceVietQR(int id, CancellationToken cancellationToken)
    {
        var invoice = await mediator.Send(new LayHoaDonTheoIdQuery(id), cancellationToken);
        if (invoice is null) return Failure("Không tìm thấy hóa đơn.", 404);

        var bankId = config["VietQRSettings:BankId"] ?? "MB";
        var bankName = config["VietQRSettings:BankName"] ?? "Ngân hàng TMCP Quân Đội (MBBank)";
        var accountNumber = config["VietQRSettings:AccountNumber"] ?? "0388888888";
        var accountName = config["VietQRSettings:AccountName"] ?? "PHONG KHAM DA KHOA CLINIC";
        var template = config["VietQRSettings:Template"] ?? "compact2";
        var prefix = config["VietQRSettings:PrefixMemo"] ?? "PK";

        var conNo = (invoice.SoTienBenhNhanChiTra > 0
            ? invoice.SoTienBenhNhanChiTra
            : invoice.TongTien - invoice.SoTienBaoHiemChiTra) - invoice.DaThanhToan;
        var amount = Math.Max(0, conNo);

        var memo = $"{prefix} {invoice.SoHoaDon}".Trim();
        var qrUrl = $"https://img.vietqr.io/image/{bankId}-{accountNumber}-{template}.png?amount={(long)amount}&addInfo={Uri.EscapeDataString(memo)}&accountName={Uri.EscapeDataString(accountName)}";
        var quickLink = $"https://api.vietqr.io/{bankId}/{accountNumber}/{(long)amount}/{Uri.EscapeDataString(memo)}/{template}.jpg?accountName={Uri.EscapeDataString(accountName)}";

        var dto = new VietQRDto
        {
            InvoiceId = invoice.Id,
            InvoiceNumber = invoice.SoHoaDon,
            Amount = amount,
            BankId = bankId,
            BankName = bankName,
            AccountNumber = accountNumber,
            AccountName = accountName,
            TransferContent = memo,
            QrUrl = qrUrl,
            QrQuickLink = quickLink
        };

        return Success(dto);
    }

    /// <summary>
    /// Lấy chi tiết hóa đơn viện phí theo ID
    /// </summary>
    [HttpGet("invoices/{id:int}")]
    public async Task<IActionResult> GetInvoice(int id, CancellationToken cancellationToken)
    {
        var invoice = await mediator.Send(new LayHoaDonTheoIdQuery(id), cancellationToken);
        return invoice is null ? Failure("Không tìm thấy hóa đơn.", 404) : Success(invoice);
    }

    /// <summary>
    /// Lấy hóa đơn viện phí gắn với lượt khám
    /// </summary>
    [HttpGet("invoices/by-visit/{visitId:int}")]
    public async Task<IActionResult> GetInvoiceByVisit(int visitId, CancellationToken cancellationToken)
    {
        var invoice = await mediator.Send(new LayHoaDonTheoLuotKhamQuery(visitId), cancellationToken);
        return invoice is null ? Failure("Lượt khám chưa có hóa đơn.", 404) : Success(invoice);
    }

    /// <summary>
    /// Lấy danh sách các phiếu thu / đợt thanh toán của hóa đơn
    /// </summary>
    [HttpGet("invoices/{id:int}/payments")]
    public async Task<IActionResult> GetPayments(int id, CancellationToken cancellationToken)
        => Success(await mediator.Send(new LayDanhSachPhieuThuQuery(id), cancellationToken));

    /// <summary>
    /// Ghi nhận đợt thanh toán mới cho hóa đơn viện phí
    /// </summary>
    [HttpPost("invoices/{id:int}/payments")]
    [ClinicalAuthorize("billing", HanhDongQuyen.TAO, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> RecordPayment(
        int id, [FromBody] RecordPaymentRequest request, CancellationToken cancellationToken)
        => Success(await mediator.Send(
            new ThanhToanHoaDonCommand(id, request, CurrentUserId), cancellationToken),
            "Ghi nhận thanh toán thành công");

    /// <summary>
    /// Áp dụng tỷ lệ chi trả bảo hiểm y tế cho hóa đơn
    /// </summary>
    [HttpPost("invoices/{id:int}/insurance")]
    [ClinicalAuthorize("billing", HanhDongQuyen.SUA, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> ApplyInsurance(
        int id, [FromBody] ApplyInsuranceRequest request, CancellationToken cancellationToken)
        => Success(await mediator.Send(
            new ApDungBaoHiemHoaDonCommand(id, request, CurrentUserId), cancellationToken),
            "Áp dụng bảo hiểm thành công");

    /// <summary>
    /// Hủy hóa đơn viện phí
    /// </summary>
    [HttpPost("invoices/{id:int}/cancel")]
    [ClinicalAuthorize("billing", HanhDongQuyen.XOA, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> Cancel(
        int id, [FromBody] CancelInvoiceRequest request, CancellationToken cancellationToken)
        => Success(await mediator.Send(
            new HuyHoaDonCommand(id, request, CurrentUserId), cancellationToken),
            "Hủy hóa đơn thành công");

    /// <summary>
    /// Lấy công nợ viện phí của một bệnh nhân
    /// </summary>
    [HttpGet("debts/by-patient/{patientId:int}")]
    public async Task<IActionResult> GetPatientDebts(int patientId, CancellationToken cancellationToken)
        => Success(await mediator.Send(new LayCongNoBenhNhanQuery(patientId), cancellationToken));

    /// <summary>
    /// Lấy danh sách các khoản công nợ viện phí quá hạn
    /// </summary>
    [HttpGet("debts/overdue")]
    public async Task<IActionResult> GetOverdueDebts(
        [FromQuery] int facilityId = 0, CancellationToken cancellationToken = default)
        => Success(await mediator.Send(new LayCongNoQuaHanQuery(facilityId), cancellationToken));

    /// <summary>
    /// Lấy danh sách công nợ bệnh nhân có phân trang và bộ lọc
    /// </summary>
    [HttpGet("debts/patients")]
    public async Task<IActionResult> GetPatientDebtsPaged(
        [FromQuery] int facilityId = 0,
        [FromQuery] string? status = null,
        [FromQuery] string? keyword = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayDanhSachCongNoBenhNhanQuery(facilityId, status, keyword, fromDate, toDate, pageIndex, pageSize),
            cancellationToken));

    /// <summary>
    /// Lấy danh sách công nợ nhà cung cấp dược/vật tư
    /// </summary>
    [HttpGet("debts/suppliers")]
    public async Task<IActionResult> GetSupplierDebts(
        [FromQuery] int facilityId = 0,
        [FromQuery] int? supplierId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? status = null,
        [FromQuery] string? keyword = null,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayDanhSachCongNoNhaCungCapQuery(facilityId, supplierId, fromDate, toDate, status, keyword, pageIndex, pageSize),
            cancellationToken));

    /// <summary>
    /// Lấy tổng quan tình hình công nợ nhà cung cấp
    /// </summary>
    [HttpGet("debts/suppliers/summary")]
    public async Task<IActionResult> GetSupplierDebtsSummary(
        [FromQuery] int facilityId = 0,
        CancellationToken cancellationToken = default)
        => Success(await mediator.Send(
            new LayTongQuanCongNoNhaCungCapQuery(facilityId),
            cancellationToken));

    /// <summary>
    /// Ghi nhận thanh toán công nợ cho nhà cung cấp
    /// </summary>
    [HttpPost("debts/suppliers/payment")]
    [ClinicalAuthorize("billing", HanhDongQuyen.TAO, PhamViDuLieu.CO_SO)]
    public async Task<IActionResult> RecordSupplierPayment(
        [FromBody] ThanhToanCongNoNhaCungCapRequest request,
        CancellationToken cancellationToken)
        => Success(await mediator.Send(
            new ThanhToanCongNoNhaCungCapCommand(request, CurrentUserId),
            cancellationToken),
            "Ghi nhận thanh toán công nợ nhà cung cấp thành công");
}
