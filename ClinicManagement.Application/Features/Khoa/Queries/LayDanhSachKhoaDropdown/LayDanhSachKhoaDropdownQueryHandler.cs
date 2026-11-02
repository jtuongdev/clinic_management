using ClinicManagement.Application.DTOs.Khoa;
using ClinicManagement.Domain.Repositories;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.Khoa.Queries;

public class LayDanhSachKhoaDropdownQueryHandler 
    : IRequestHandler<LayDanhSachKhoaDropdownQuery, IReadOnlyList<KhoaDropdownDto>>
{
    private readonly IKhoaRepository _repository;

    public LayDanhSachKhoaDropdownQueryHandler(IKhoaRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<KhoaDropdownDto>> Handle(
        LayDanhSachKhoaDropdownQuery request,
        CancellationToken cancellationToken)
    {
        var khoas = await _repository.GetKhoasByCoSoAsync(request.MaCoSo);

        return khoas
            .Select(x => new KhoaDropdownDto
            {
                Id = x.Id,
                Ma = x.Ma ?? string.Empty,
                Ten = x.Ten,
                MaCoSo = x.MaCoSo
            })
            .ToList();
    }
}
