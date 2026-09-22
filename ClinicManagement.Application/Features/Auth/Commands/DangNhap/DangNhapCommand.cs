using MediatR;
using ClinicManagement.Application.DTOs.Auth;

namespace ClinicManagement.Application.Features.Auth.Commands
{
    public class DangNhapCommand : IRequest<LoginResponse>
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}