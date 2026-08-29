using MediatR;
using ClinicManagement.Application.DTOs.CoSo;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.CoSo.Queries
{
    public class GetCoSoDropdownQuery 
        : IRequest<IReadOnlyList<CoSoDropdownDto>>
    {
    }
}