namespace ClinicManagement.Application.DTOs.Billing;

public sealed class VietQRDto
{
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string BankId { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string TransferContent { get; set; } = string.Empty;
    public string QrUrl { get; set; } = string.Empty;
    public string QrQuickLink { get; set; } = string.Empty;
}
