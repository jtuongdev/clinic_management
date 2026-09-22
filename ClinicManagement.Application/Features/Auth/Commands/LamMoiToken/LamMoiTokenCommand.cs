using MediatR;
using ClinicManagement.Application.DTOs.Auth;

namespace ClinicManagement.Application.Features.Auth.Commands
{
    public record LamMoiTokenCommand(string RefreshToken) : IRequest<LoginResponse>;
}
