using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class DeleteChiDinhDichVuCommandHandler : IRequestHandler<DeleteChiDinhDichVuCommand, bool>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public DeleteChiDinhDichVuCommandHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<bool> Handle(DeleteChiDinhDichVuCommand request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Mã lượt khám không hợp lệ.");

            if (request.ChiDinhDichVuId <= 0)
                throw new ArgumentException("Mã chỉ định dịch vụ không hợp lệ.");

            var luotKham = await _luotKhamRepository.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.LuotKhamId}.");

            var item = luotKham.ChiDinhDichVus
                .FirstOrDefault(x => x.Id == request.ChiDinhDichVuId && !x.IsDeleted);

            if (item == null)
                throw new KeyNotFoundException($"Không tìm thấy chỉ định dịch vụ {request.ChiDinhDichVuId}.");

            item.SoftDelete(request.DeletedBy);
            _luotKhamRepository.Update(luotKham);
            await _luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
