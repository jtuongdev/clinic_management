using MediatR;
using ClinicManagement.Application.Common.Models;

namespace ClinicManagement.Application.Features.Auth.Commands
{
    public record DangXuatCommand(int UserId, string? RefreshToken = null) : IRequest<Result<bool>>;
}
