using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Application.DTOs.Billing;

public sealed record RecordPaymentRequest(
    decimal SoTien,
    PhuongThucThanhToan PhuongThuc,
    string? GhiChu);

public sealed record ApplyInsuranceRequest(decimal SoTienBaoHiem);

public sealed record CancelInvoiceRequest(string? LyDoHuy);
