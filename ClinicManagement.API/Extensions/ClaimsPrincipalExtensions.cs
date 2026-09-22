using System.Security.Claims;

namespace ClinicManagement.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        public static string GetUserName(this ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;

        public static string GetUserFullName(this ClaimsPrincipal user)
            => user.FindFirst("FullName")?.Value ?? string.Empty;

        public static string GetUserEmail(this ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;

        public static List<string> GetUserRoles(this ClaimsPrincipal user)
            => user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        public static int GetCoSoId(this ClaimsPrincipal user)
        {
            var claim = user.FindFirst("CoSoId")?.Value 
                     ?? user.FindFirst("MaCoSo")?.Value 
                     ?? user.FindFirst("FacilityId")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        public static bool IsAuthenticated(this ClaimsPrincipal user)
            => user.Identity?.IsAuthenticated ?? false;
    }
}
