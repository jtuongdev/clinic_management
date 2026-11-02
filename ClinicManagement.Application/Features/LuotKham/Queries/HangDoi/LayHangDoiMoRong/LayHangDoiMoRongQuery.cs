using MediatR;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayHangDoiMoRongQuery : IRequest<PagedResult<HangDoiDto>>
    {
        public int MaBacSi { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}