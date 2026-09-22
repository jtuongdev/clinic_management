using AutoMapper;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayBenhNhanTheoIdQueryHandler : IRequestHandler<LayBenhNhanTheoIdQuery, BenhNhanDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IMapper _mapper;

        public LayBenhNhanTheoIdQueryHandler(IBenhNhanRepository benhNhanRepo, IMapper mapper)
        {
            _benhNhanRepo = benhNhanRepo;
            _mapper = mapper;
        }

        public async Task<BenhNhanDto> Handle(LayBenhNhanTheoIdQuery request, CancellationToken cancellationToken)
        {
            var benhNhan = await _benhNhanRepo.GetByIdAsync(request.Id);
            if (benhNhan == null)
                throw new KeyNotFoundException($"Không tìm thấy bệnh nhân với Id = {request.Id}");

            return _mapper.Map<BenhNhanDto>(benhNhan);
        }
    }
}