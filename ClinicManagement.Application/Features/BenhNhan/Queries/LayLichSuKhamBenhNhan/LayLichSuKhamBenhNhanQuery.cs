using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;
using System;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayLichSuKhamBenhNhanQuery : IRequest<PagedResult<LuotKhamDto>>
    {
        public int PatientId { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}