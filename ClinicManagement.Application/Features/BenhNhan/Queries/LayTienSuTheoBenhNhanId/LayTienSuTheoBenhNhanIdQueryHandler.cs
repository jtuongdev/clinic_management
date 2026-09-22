using AutoMapper;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayTienSuTheoBenhNhanIdQueryHandler : IRequestHandler<LayTienSuTheoBenhNhanIdQuery, IReadOnlyList<TienSuBenhDto>>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IMapper _mapper;

        public LayTienSuTheoBenhNhanIdQueryHandler(IBenhNhanRepository benhNhanRepo, IMapper mapper)
        {
            _benhNhanRepo = benhNhanRepo;
            _mapper = mapper;
        }

        public async Task<IReadOnlyList<TienSuBenhDto>> Handle(LayTienSuTheoBenhNhanIdQuery request, CancellationToken cancellationToken)
        {
            var tienSus = await _benhNhanRepo.GetTienSuByBenhNhanIdAsync(request.BenhNhanId);
            return _mapper.Map<IReadOnlyList<TienSuBenhDto>>(tienSus);
        }
    }
}