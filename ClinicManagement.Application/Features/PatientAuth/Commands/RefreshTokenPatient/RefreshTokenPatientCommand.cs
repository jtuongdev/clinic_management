using MediatR;
using ClinicManagement.Application.DTOs.PatientAuth;

namespace ClinicManagement.Application.Features.PatientAuth.Commands.RefreshTokenPatient
{
    public class RefreshTokenPatientCommand : IRequest<PatientAuthResponseDto>
    {
        public string RefreshToken { get; set; } = string.Empty;

        public RefreshTokenPatientCommand(string refreshToken)
        {
            RefreshToken = refreshToken;
        }

        public RefreshTokenPatientCommand() { }
    }
}
