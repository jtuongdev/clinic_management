using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhanLabResultsQuery : IRequest<PagedResult<ChiDinhDichVuDto>>
    {
        public int PatientId { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}