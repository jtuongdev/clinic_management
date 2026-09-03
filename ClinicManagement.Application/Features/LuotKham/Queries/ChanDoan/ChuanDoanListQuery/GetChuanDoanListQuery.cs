using System.Collections.Generic;
using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetChuanDoanListQuery : IRequest<List<ChanDoanDto>>
    {
        public int? LuotKhamId { get; set; }
    }
}