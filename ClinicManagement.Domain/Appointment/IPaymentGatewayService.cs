using System;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Domain.Appointment
{
    /// <summary>
    /// Cổng thanh toán trực tuyến (Để ngỏ interface để phát triển tích hợp VNPay, MoMo, ZaloPay ở giai đoạn sau).
    /// Hiện tại hệ thống áp dụng 100% TIỀN MẶT TẠI QUẦY theo yêu cầu nghiệp vụ.
    /// </summary>
    public interface IPaymentGatewayService
    {
        // TODO: Tích hợp cổng thanh toán trực tuyến (VNPay / MoMo / ZaloPay) giai đoạn tiếp theo
        Task<PaymentGatewayResult> CreatePaymentUrlAsync(int appointmentId, decimal amount, string returnUrl, CancellationToken cancellationToken = default);
        Task<PaymentGatewayCallbackResult> ProcessCallbackAsync(string queryParams, CancellationToken cancellationToken = default);
    }

    public class PaymentGatewayResult
    {
        public bool Success { get; set; }
        public string PaymentUrl { get; set; } = string.Empty;
        public string TransactionRef { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
    }

    public class PaymentGatewayCallbackResult
    {
        public bool IsSuccessful { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Message { get; set; }
    }
}
