using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common; 

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetHangDoiQuery : IRequest<PagedResult<BenhNhanListDto>>
    {
        public int MaBacSi { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}