using AutoMapper;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayTienSuMoiNhatQueryHandler : IRequestHandler<LayTienSuMoiNhatQuery, TienSuBenhDto?>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IMapper _mapper;

        public LayTienSuMoiNhatQueryHandler(IBenhNhanRepository benhNhanRepo, IMapper mapper)
        {
            _benhNhanRepo = benhNhanRepo;
            _mapper = mapper;
        }

        public async Task<TienSuBenhDto?> Handle(LayTienSuMoiNhatQuery request, CancellationToken cancellationToken)
        {
            var tienSu = await _benhNhanRepo.GetLatestTienSuAsync(request.BenhNhanId);
            return tienSu != null ? _mapper.Map<TienSuBenhDto>(tienSu) : null;
        }
    }
}