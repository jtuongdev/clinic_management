using ClinicManagement.Application.DTOs.CoSo;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore; 
using System.Linq;

namespace ClinicManagement.Application.Features.CoSo.Queries;
public class LayDanhSachCoSoDropdownQueryHandler 
: IRequestHandler<LayDanhSachCoSoDropdownQuery, IReadOnlyList<CoSoDropdownDto>>
{
    private readonly ICoSoRepository _repository;

    public LayDanhSachCoSoDropdownQueryHandler(ICoSoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<CoSoDropdownDto>> Handle(
        LayDanhSachCoSoDropdownQuery request,
        CancellationToken cancellationToken)
    {
        var result = await _repository.GetQueryable()
            .AsNoTracking()
            .Select(x => new CoSoDropdownDto
            {
                Id = x.Id,
                Ma = x.Ma,
                Ten = x.Ten
            })
            .ToListAsync(cancellationToken);

        return result;
    }
}