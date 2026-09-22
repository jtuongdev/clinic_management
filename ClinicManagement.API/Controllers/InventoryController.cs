using ClinicManagement.API.Authorization;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Common;
using ClinicManagement.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

[ApiController]
[Route("api/inventory")]
[ClinicalAuthorize("inventory", HanhDongQuyen.XEM, PhamViDuLieu.CO_SO)]
public sealed partial class InventoryController(
    IMediator mediator,
    ILogger<InventoryController> logger) : BaseController
{
    protected async Task<IActionResult> Send<T>(T command) where T : IRequest<InventoryResult>
    {
        var operation = typeof(T).Name;
        logger.LogInformation(
            "Inventory API bắt đầu xử lý. Operation={Operation}, UserId={UserId}, Path={Path}, Query={Query}",
            operation, CurrentUserId, Request.Path, Request.QueryString);

        try
        {
            var result = await mediator.Send(command);

            if (result.RawJson is not null)
            {
                logger.LogInformation(
                    "Inventory API trả raw response. Operation={Operation}, StatusCode={StatusCode}",
                    operation, result.StatusCode);
                var response = Content(result.RawJson, "application/json");
                response.StatusCode = result.StatusCode;
                return response;
            }

            if (!result.IsSuccess)
            {
                logger.LogWarning(
                    "Inventory API xử lý thất bại. Operation={Operation}, StatusCode={StatusCode}, Message={Message}",
                    operation, result.StatusCode, result.Message);
                return Failure(result.Message!, result.StatusCode);
            }

            if (result.Data is null)
            {
                logger.LogWarning(
                    "Inventory API gọi thành công nhưng không có dữ liệu. Operation={Operation}, StatusCode={StatusCode}",
                    operation, result.StatusCode);
            }
            else
            {
                logger.LogInformation(
                    "Inventory API xử lý thành công. Operation={Operation}, StatusCode={StatusCode}",
                    operation, result.StatusCode);
            }

            return Success(result.Data);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Inventory API không gọi được hoặc xảy ra lỗi ngoài dự kiến. Operation={Operation}, UserId={UserId}, Path={Path}, Query={Query}",
                operation, CurrentUserId, Request.Path, Request.QueryString);
            throw;
        }
    }
}
