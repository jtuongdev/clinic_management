using AutoMapper;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class TimKiemBenhNhanQueryHandler : IRequestHandler<TimKiemBenhNhanQuery, IReadOnlyList<BenhNhanDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IMapper _mapper;

        public TimKiemBenhNhanQueryHandler(IBenhNhanRepository benhNhanRepo, IMapper mapper)
        {
            _benhNhanRepo = benhNhanRepo;
            _mapper = mapper;
        }

        public async Task<IReadOnlyList<BenhNhanDto>> Handle(TimKiemBenhNhanQuery request, CancellationToken cancellationToken)
        {
            var benhNhans = await _benhNhanRepo.SearchAsync(request.Keyword);
            return _mapper.Map<IReadOnlyList<BenhNhanDto>>(benhNhans);
        }
    }
}