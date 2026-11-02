using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Common.Interfaces;

public interface IEmailSender
{
    Task SendEmailAsync(
        string toEmail,
        string subject,
        string htmlBody,
        byte[]? attachment = null,
        string? attachmentName = null,
        CancellationToken cancellationToken = default);
}
