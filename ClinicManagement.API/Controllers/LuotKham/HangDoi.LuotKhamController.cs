using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;
using System;

namespace ClinicManagement.API.Controllers
{
    public partial class LuotKhamController : BaseController
    {
        [HttpGet("hang-doi")]
        public async Task<IActionResult> GetHangDoi(
            [FromQuery] int? maBacSi,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10)
        {
            // Nếu không truyền maBacSi, lấy của chính mình
            int bacSiId = maBacSi ?? CurrentUserId;

            // Nếu là admin và có truyền maBacSi khác, cho phép
            if (maBacSi.HasValue && IsInRole("Admin"))
            {
                bacSiId = maBacSi.Value;
            }
            // Nếu không phải admin, chỉ được xem hàng đợi của mình
            else if (!IsInRole("Admin") && maBacSi.HasValue && maBacSi.Value != CurrentUserId)
            {
                return Failure("Bạn không có quyền xem hàng đợi của bác sĩ khác", 403);
            }
            // Validate mạnh mẽ
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            Console.WriteLine($"maBacSi = {maBacSi}, pageIndex = {pageIndex}, pageSize = {pageSize}");

            var query = new GetHangDoiQuery
            {
                MaBacSi = bacSiId,
                PageIndex = pageIndex,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }
        [HttpGet("hang-doi-list")]
        public async Task<IActionResult> GetHangDoiExtended(
            [FromQuery] int maBacSi = 0,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10)
        {
            // Xác định maBacSi: nếu không truyền, lấy từ token
            int bacSiId = maBacSi > 0 ? maBacSi : CurrentUserId;

            // Nếu không phải admin và yêu cầu xem bác sĩ khác -> 403
            if (maBacSi > 0 && maBacSi != CurrentUserId && !IsInRole("Admin"))
            {
                return Failure("Bạn không có quyền xem hàng đợi của bác sĩ khác", 403);
            }

            // Validate phân trang
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100;

            var query = new GetHangDoiExtendedQuery
            {
                MaBacSi = bacSiId,
                PageIndex = pageIndex,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query);
            return Success(result);
        }
        
   
    }
}