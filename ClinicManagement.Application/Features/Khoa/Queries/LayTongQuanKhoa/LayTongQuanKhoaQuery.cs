using MediatR;
using ClinicManagement.Application.DTOs.Khoa;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.Khoa.Queries
{
    public class LayTongQuanKhoaQuery : IRequest<List<KhoaOverviewDto>>
    {
        public int? MaCoSo { get; set; }
    }
}