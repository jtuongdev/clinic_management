using MediatR;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.BenhNhan;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhansPagedQuery : IRequest<PagedResult<BenhNhanDto>>
    {
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 10;
        public string? Keyword { get; set; }
        public bool IncludeDeleted { get; set; } = false;
    }
}