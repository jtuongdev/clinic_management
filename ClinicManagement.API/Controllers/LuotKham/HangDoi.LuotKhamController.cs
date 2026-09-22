using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.API.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ClinicManagement.Application.Features.LuotKham.Queries;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace ClinicManagement.API.Controllers
{
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM, PhamViDuLieu.KHOA_PHONG)]
    public partial class LuotKhamController : BaseController
    {
        [HttpGet("hang-doi")]
        public async Task<IActionResult> GetHangDoi(
            [FromQuery] int? maBacSi,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 1000)
        {
            // Nếu không truyền maBacSi hoặc truyền <= 0, lấy của chính mình (CurrentUserId)
            int bacSiId = (maBacSi.HasValue && maBacSi.Value > 0) ? maBacSi.Value : CurrentUserId;
            
            bool isAdmin = CurrentUserRoles.Any(r => r.Contains("ADMIN", StringComparison.OrdinalIgnoreCase));

            // Nếu là admin và có truyền maBacSi khác, cho phép
            if (maBacSi.HasValue && maBacSi.Value > 0 && isAdmin)
            {
                bacSiId = maBacSi.Value;
            }
            // Nếu không phải admin, chỉ được xem hàng đợi của mình
            else if (!isAdmin && maBacSi.HasValue && maBacSi.Value > 0 && maBacSi.Value != CurrentUserId)
            {
                return Failure("Bạn không có quyền xem hàng đợi của bác sĩ khác", 403);
            }
            // Validate mạnh mẽ
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 1000;
            if (pageSize > 2000) pageSize = 2000;

            Console.WriteLine($"maBacSi = {maBacSi}, pageIndex = {pageIndex}, pageSize = {pageSize}");

            var query = new LayHangDoiQuery
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
            [FromQuery] int pageSize = 1000)
        {
            // Xác định maBacSi: nếu không truyền, lấy từ token
            int bacSiId = maBacSi > 0 ? maBacSi : CurrentUserId;
            
            bool isAdmin = CurrentUserRoles.Any(r => r.Contains("ADMIN", StringComparison.OrdinalIgnoreCase));

            // Nếu không phải admin và yêu cầu xem bác sĩ khác -> 403
            if (maBacSi > 0 && maBacSi != CurrentUserId && !isAdmin)
            {
                return Failure("Bạn không có quyền xem hàng đợi của bác sĩ khác", 403);
            }

            // Tạm thời load toàn bộ hàng đợi để không giới hạn số lượng trên UI
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 1000;
            if (pageSize > 2000) pageSize = 2000;

            var query = new LayHangDoiMoRongQuery
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