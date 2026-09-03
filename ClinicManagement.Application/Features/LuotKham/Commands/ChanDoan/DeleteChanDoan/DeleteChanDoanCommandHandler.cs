using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class DeleteChanDoanCommandHandler : IRequestHandler<DeleteChanDoanCommand>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public DeleteChanDoanCommandHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task Handle(DeleteChanDoanCommand request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0 || request.ChanDoanId <= 0)
                throw new ArgumentException("Thông tin chẩn đoán không hợp lệ.");

            var luotKham = await _luotKhamRepository.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám với Id = {request.LuotKhamId}");

            if (luotKham.TrangThai != TrangThaiLuotKham.DANG_KHAM)
                throw new InvalidOperationException("Chỉ được xóa chẩn đoán khi lượt khám đang ở trạng thái đang khám.");

            var diagnosis = luotKham.ChanDoans?.FirstOrDefault(x => x.Id == request.ChanDoanId && !x.IsDeleted);
            if (diagnosis == null)
                throw new KeyNotFoundException($"Không tìm thấy chẩn đoán với Id = {request.ChanDoanId}");

            diagnosis.SoftDelete(request.DeletedBy);
            _luotKhamRepository.Update(luotKham);
            await _luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
