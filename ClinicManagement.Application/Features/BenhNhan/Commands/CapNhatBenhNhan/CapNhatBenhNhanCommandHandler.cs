using AutoMapper;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Patient;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class CapNhatBenhNhanCommandHandler : IRequestHandler<CapNhatBenhNhanCommand, BenhNhanDto>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IMapper _mapper;

        public CapNhatBenhNhanCommandHandler(IBenhNhanRepository benhNhanRepo, IMapper mapper)
        {
            _benhNhanRepo = benhNhanRepo;
            _mapper = mapper;
        }

        public async Task<BenhNhanDto> Handle(CapNhatBenhNhanCommand request, CancellationToken cancellationToken)
        {
            var benhNhan = await _benhNhanRepo.GetByIdAsync(request.Id);
            if (benhNhan == null)
                throw new KeyNotFoundException($"Không tìm thấy bệnh nhân với Id = {request.Id}");

            // Cập nhật thông tin
            benhNhan.UpdatePersonalInfo(
                request.Ho,
                request.Ten,
                request.NgaySinh,
                request.GioiTinh,
                request.DienThoai,
                request.Email,
                request.DiaChi,
                request.NguoiLienHeTen,
                request.NguoiLienHeDienThoai
            );
            benhNhan.MarkAsUpdated(request.UpdatedBy);

            _benhNhanRepo.Update(benhNhan);
            await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            var result = await _benhNhanRepo.GetByIdAsync(benhNhan.Id);
            return _mapper.Map<BenhNhanDto>(result);
        }
    }
}