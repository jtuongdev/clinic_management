using MediatR;
using ClinicManagement.Domain.Repositories;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class XoaBenhNhanCommandHandler : IRequestHandler<XoaBenhNhanCommand, bool>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public XoaBenhNhanCommandHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<bool> Handle(XoaBenhNhanCommand request, CancellationToken cancellationToken)
        {
            var benhNhan = await _benhNhanRepo.GetByIdAsync(request.Id);
            if (benhNhan == null)
                throw new KeyNotFoundException($"Không tìm thấy bệnh nhân với Id = {request.Id}");
            benhNhan.SoftDelete(request.DeletedBy);
            _benhNhanRepo.Update(benhNhan);
            await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}