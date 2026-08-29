using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class StartExamCommandHandler : IRequestHandler<StartExamCommand, StartExamResultDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public StartExamCommandHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<StartExamResultDto> Handle(
            StartExamCommand request,
            CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
                throw new ArgumentException("Id lượt khám không hợp lệ.");

            var luotKham = await _luotKhamRepo.GetByIdAsync(request.Id);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám với Id = {request.Id}");

            if (luotKham.TrangThai == TrangThaiLuotKham.DANG_KHAM)
                throw new InvalidOperationException("Bệnh nhân đang được khám. Không thể bắt đầu khám lại.");

            if (luotKham.TrangThai != TrangThaiLuotKham.CHO_KHAM)
                throw new InvalidOperationException(
                    $"Không thể bắt đầu khám khi trạng thái hiện tại là {luotKham.TrangThai}. Chỉ cho phép bắt đầu khi trạng thái là {TrangThaiLuotKham.CHO_KHAM}.");

            if (request.MaBacSi > 0)
            {
                if (luotKham.MaBacSi != request.MaBacSi)
                    luotKham.AssignDoctor(request.MaBacSi);
            }
            else if (luotKham.MaBacSi == null)
            {
                throw new InvalidOperationException("Không xác định được mã bác sĩ đang khám. Vui lòng đăng nhập với tài khoản bác sĩ hợp lệ.");
            }

            luotKham.StartExam();
            _luotKhamRepo.Update(luotKham);
            await _luotKhamRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new StartExamResultDto
            {
                Id = luotKham.Id,
                MaBenhNhan = luotKham.MaBenhNhan,
                MaBacSi = luotKham.MaBacSi,
                TrangThai = luotKham.TrangThai.ToString(),
                ThoiGianBatDauKham = luotKham.ThoiGianBatDauKham,
                Message = "Bắt đầu khám thành công."
            };
        }
    }
}
