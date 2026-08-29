using System.Security.Claims;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Application.Common.Interfaces
{
    public interface IJwtService
    {
        string GenerateAccessToken(NhanVien user, IEnumerable<string> roles);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
        bool ValidateToken(string token);
    }
}
