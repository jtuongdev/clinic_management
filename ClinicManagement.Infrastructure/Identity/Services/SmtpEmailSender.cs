using System;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

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
        var enableSsl = bool.TryParse(_configuration["EmailSettings:EnableSsl"], out var ssl) ? ssl : true;

        try
        {
            using var message = new MailMessage();
            message.From = new MailAddress(senderEmail, senderName);
            message.To.Add(new MailAddress(toEmail.Trim()));
            message.Subject = subject;
            message.Body = htmlBody;
            message.IsBodyHtml = true;

            if (attachment != null && !string.IsNullOrWhiteSpace(attachmentName))
            {
                using var ms = new System.IO.MemoryStream(attachment);
                message.Attachments.Add(new Attachment(ms, attachmentName));
            }

            using var client = new SmtpClient(smtpServer, port);
            client.Credentials = new NetworkCredential(senderEmail, password);
            client.EnableSsl = enableSsl;

            _logger.LogInformation("Đang gửi email tới {ToEmail} qua SMTP server {Server}:{Port}...", toEmail, smtpServer, port);
            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Gửi email thành công tới {ToEmail} với tiêu đề '{Subject}'.", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Thất bại khi gửi email tới {ToEmail}. Tiêu đề: {Subject}", toEmail, subject);
            // Không re-throw để tránh chặn đứng tiến trình nghiệp vụ chính của người dùng
        }
    }
}
