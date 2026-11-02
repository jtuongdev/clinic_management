using MediatR;
using ClinicManagement.Application.Common.Models;

namespace ClinicManagement.Application.Features.Auth.Commands;

public class DoiMatKhauCommand : IRequest<Result<bool>>
{
    public int UserId { get; set; }
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
