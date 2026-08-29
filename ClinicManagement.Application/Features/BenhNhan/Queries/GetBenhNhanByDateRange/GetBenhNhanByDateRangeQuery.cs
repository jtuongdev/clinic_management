using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhanByDateRangeQuery : IRequest<IReadOnlyList<BenhNhanDto>>
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}