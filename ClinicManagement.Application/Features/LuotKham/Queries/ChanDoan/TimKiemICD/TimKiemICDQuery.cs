using System.Collections.Generic;
using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class TimKiemICDQuery : IRequest<List<ICDOptionDto>>
    {
        public string? Keyword { get; set; }
    }
}
