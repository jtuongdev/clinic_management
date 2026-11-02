using System.ComponentModel.DataAnnotations;
using System.Reflection;
using ClinicManagement.API.Common;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Danh mục Từ điển Enum (Enum Catalogs) - Cung cấp danh sách nhãn hiển thị cho Frontend
/// Route: api/EnumCatalog, api/enum-catalog
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Route("api/enum-catalog")]
[Authorize]
public sealed class EnumCatalogController : BaseController
{
    /// <summary>
    /// Lấy danh mục trạng thái lịch làm việc
    /// </summary>
    [HttpGet("schedule-statuses")]
    public IActionResult ScheduleStatuses() => Success(ToCatalog<TrangThaiLichLamViec>());

    /// <summary>
    /// Lấy danh mục trạng thái chấm công
    /// </summary>
    [HttpGet("attendance-statuses")]
    public IActionResult AttendanceStatuses() => Success(ToCatalog<TrangThaiChamCong>());

    /// <summary>
    /// Lấy danh mục trạng thái nghỉ phép
    /// </summary>
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
