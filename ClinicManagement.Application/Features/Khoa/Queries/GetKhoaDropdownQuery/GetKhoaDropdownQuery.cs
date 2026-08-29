using ClinicManagement.Application.DTOs.Khoa;
using MediatR;

namespace ClinicManagement.Application.Features.Khoa.Queries;

public class GetKhoaDropdownQuery 
    : IRequest<IReadOnlyList<KhoaDropdownDto>>
{
    public int MaCoSo { get; set; } 
}