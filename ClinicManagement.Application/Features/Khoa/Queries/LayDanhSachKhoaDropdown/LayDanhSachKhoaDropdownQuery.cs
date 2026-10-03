using ClinicManagement.Application.DTOs.Khoa;
using MediatR;

namespace ClinicManagement.Application.Features.Khoa.Queries;

public class LayDanhSachKhoaDropdownQuery 
    : IRequest<IReadOnlyList<KhoaDropdownDto>>
{
    public int? MaCoSo { get; set; } 
}