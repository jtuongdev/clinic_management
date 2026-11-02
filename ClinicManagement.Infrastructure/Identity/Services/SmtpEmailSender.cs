using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Common.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace ClinicManagement.Infrastructure.Identity.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody,
        byte[]? attachment = null,
        string? attachmentName = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            _logger.LogWarning("Bỏ qua gửi email vì địa chỉ người nhận rỗng.");
            return;
        }

        var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
        var port = int.TryParse(_configuration["EmailSettings:Port"], out var p) ? p : 587;
        var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "dangjtuong97@gmail.com";
        var senderName = _configuration["EmailSettings:SenderName"] ?? "Phòng khám Đa khoa Clinic";
        var password = _configuration["EmailSettings:Password"] ?? "xjjshcdpnqcijsrv";

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(new MailboxAddress(toEmail.Trim(), toEmail.Trim()));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };

            if (attachment != null && !string.IsNullOrWhiteSpace(attachmentName))
            {
                builder.Attachments.Add(attachmentName, attachment);
            }

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            // Tắt kiểm tra thu hồi chứng chỉ (Certificate Revocation) để tương thích macOS và mạng chặn CRL/OCSP
            client.CheckCertificateRevocation = false;

            var secureSocketOption = port == 465 
                ? SecureSocketOptions.SslOnConnect 
                : (port == 587 ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto);

            _logger.LogInformation("Đang gửi email tới {ToEmail} qua SMTP {Server}:{Port}...", toEmail, smtpServer, port);

            await client.ConnectAsync(smtpServer, port, secureSocketOption, cancellationToken);

            if (!string.IsNullOrWhiteSpace(senderEmail) && !string.IsNullOrWhiteSpace(password))
            {
                await client.AuthenticateAsync(senderEmail, password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Gửi email thành công tới {ToEmail} với tiêu đề '{Subject}'.", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Thất bại khi gửi email tới {ToEmail}. Tiêu đề: {Subject}. Lỗi: {Message}", toEmail, subject, ex.Message);
            // Không re-throw để tránh gián đoạn luồng nghiệp vụ chính của người dùng
        }
    }
}
