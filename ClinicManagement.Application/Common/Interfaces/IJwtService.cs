using System.Security.Claims;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Application.Common.Interfaces
{
    public interface IJwtService
    {
        string GenerateAccessToken(NhanVien user, IEnumerable<string> roles);
        string GeneratePatientAccessToken(BenhNhan patient);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
        bool ValidateToken(string token);
    }
}
