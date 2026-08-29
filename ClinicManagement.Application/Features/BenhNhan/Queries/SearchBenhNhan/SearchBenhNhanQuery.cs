using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class SearchBenhNhanQuery : IRequest<IReadOnlyList<BenhNhanDto>>
    {
        public string Keyword { get; set; } = string.Empty;
    }
}