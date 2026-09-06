using System.ComponentModel.DataAnnotations;
using System.Reflection;
using ClinicManagement.API.Common;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class EnumCatalogController : BaseController
{
    [HttpGet("schedule-statuses")]
    public IActionResult ScheduleStatuses() => Success(ToCatalog<TrangThaiLichLamViec>());

    [HttpGet("attendance-statuses")]
    public IActionResult AttendanceStatuses() => Success(ToCatalog<TrangThaiChamCong>());

    [HttpGet("leave-statuses")]
    public IActionResult LeaveStatuses() => Success(ToCatalog<TrangThaiNghiPhep>());

    private static IReadOnlyList<EnumCatalogItem> ToCatalog<T>() where T : struct, Enum =>
        Enum.GetValues<T>().Select(value =>
        {
            var member = typeof(T).GetMember(value.ToString()).Single();
            var display = member.GetCustomAttribute<DisplayAttribute>();
            return new EnumCatalogItem(value.ToString(), display?.GetName() ?? value.ToString());
        }).ToList();

    private sealed record EnumCatalogItem(string Code, string Label);
}
