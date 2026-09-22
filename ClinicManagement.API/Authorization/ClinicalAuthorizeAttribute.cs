using ClinicManagement.Application.Services.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace ClinicManagement.API.Authorization;

[AttributeUsage(AttributeTargets.Method)]
public sealed class AllowSelfAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
public sealed class ClinicalAuthorizeAttribute : TypeFilterAttribute
{
    public ClinicalAuthorizeAttribute(
        string phanHe,
        HanhDongQuyen hanhDong,
        PhamViDuLieu phamVi = PhamViDuLieu.KHOA_PHONG)
        : base(typeof(ClinicalAuthorizeFilter))
    {
        Arguments = [phanHe, hanhDong, phamVi];
    }
}

public sealed class ClinicalAuthorizeFilter(
    IClinicalGovernanceService governance,
    string phanHe,
    HanhDongQuyen hanhDong,
    PhamViDuLieu phamVi) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (context.ActionDescriptor.EndpointMetadata.OfType<IAllowAnonymous>().Any())
        {
            await next();
            return;
        }

        var user = context.HttpContext.User;
        if (user.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (context.ActionDescriptor.EndpointMetadata.OfType<AllowSelfAttribute>().Any())
        {
            await next();
            return;
        }

        var claim = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                 ?? user.FindFirst("sub")?.Value 
                 ?? user.FindFirst("userId")?.Value;
        if (!int.TryParse(claim, out var maNguoiDung))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userRoles = user.FindAll(System.Security.Claims.ClaimTypes.Role)
            .Concat(user.FindAll("role"))
            .Select(c => c.Value)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .Distinct()
            .ToList();

        var permitted = await governance.HasPermissionAsync(
            maNguoiDung, phanHe, hanhDong.ToString(), phamVi, userRoles,
            context.HttpContext.RequestAborted);
        if (!permitted)
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}
