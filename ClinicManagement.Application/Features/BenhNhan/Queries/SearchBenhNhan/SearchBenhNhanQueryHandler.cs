using AutoMapper;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class SearchBenhNhanQueryHandler : IRequestHandler<SearchBenhNhanQuery, IReadOnlyList<BenhNhanDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IMapper _mapper;

        public SearchBenhNhanQueryHandler(IBenhNhanRepository benhNhanRepo, IMapper mapper)
        {
            _benhNhanRepo = benhNhanRepo;
            _mapper = mapper;
        }

        public async Task<IReadOnlyList<BenhNhanDto>> Handle(SearchBenhNhanQuery request, CancellationToken cancellationToken)
        {
            var benhNhans = await _benhNhanRepo.SearchAsync(request.Keyword);
            return _mapper.Map<IReadOnlyList<BenhNhanDto>>(benhNhans);
        }
    }
}