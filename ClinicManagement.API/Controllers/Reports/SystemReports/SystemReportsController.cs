using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Enterprise System Reports & Analytics
/// </summary>
[ApiController]
[Route("api/system-reports")]
[ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class SystemReportsController(IMediator mediator) : BaseController
{
}
