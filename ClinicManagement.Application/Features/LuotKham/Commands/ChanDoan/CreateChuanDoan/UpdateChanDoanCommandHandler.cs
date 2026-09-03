using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class UpdateChanDoanCommandHandler : IRequestHandler<UpdateChanDoanCommand, ChanDoanDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public UpdateChanDoanCommandHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<ChanDoanDto> Handle(UpdateChanDoanCommand request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Id lượt khám không hợp lệ.");

            if (request.ChanDoanId <= 0)
                throw new ArgumentException("Id chẩn đoán không hợp lệ.");

            if (request.Data == null || string.IsNullOrWhiteSpace(request.Data.MaICD))
                throw new ArgumentException("Mã ICD là bắt buộc.");

            if (string.IsNullOrWhiteSpace(request.Data.TenChanDoan))
                throw new ArgumentException("Tên chẩn đoán là bắt buộc.");

            var luotKham = await _luotKhamRepository.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám với Id = {request.LuotKhamId}");

            if (luotKham.TrangThai != TrangThaiLuotKham.DANG_KHAM)
                throw new InvalidOperationException("Chỉ được cập nhật chẩn đoán khi lượt khám đang ở trạng thái đang khám.");

            var activeDiagnoses = luotKham.ChanDoans?.Where(x => !x.IsDeleted).ToList() ?? [];


            var diagnosis = activeDiagnoses.FirstOrDefault(x => x.Id == request.ChanDoanId)
                ?? throw new KeyNotFoundException($"Không tìm thấy chẩn đoán với Id = {request.ChanDoanId}");

            var maICD = request.Data.MaICD.Trim();
            var tenChanDoan = request.Data.TenChanDoan.Trim();
            var ghiChu = request.Data.GhiChu?.Trim() ?? string.Empty;

            // Kiểm tra trùng mã ICD (loại trừ chính nó)
            if (activeDiagnoses.Any(x => x.MaICD.Equals(maICD, StringComparison.OrdinalIgnoreCase) && x.Id != request.ChanDoanId))
                throw new InvalidOperationException("Mã ICD đã tồn tại trong lượt khám này.");

            // Chỉ được một chẩn đoán chính
            if (request.Data.LaChanDoanChinh && activeDiagnoses.Any(x => x.LaChanDoanChinh && x.Id != request.ChanDoanId))
                throw new InvalidOperationException("Lượt khám chỉ được có một chẩn đoán chính.");

            // Cập nhật
            diagnosis.Update(maICD, tenChanDoan, request.Data.LaChanDoanChinh, ghiChu, request.UpdatedBy);

            _luotKhamRepository.Update(luotKham);
            await _luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new ChanDoanDto
            {
                Id = diagnosis.Id,
                MaICD = diagnosis.MaICD,
                TenChanDoan = diagnosis.TenChanDoan,
                LaChanDoanChinh = diagnosis.LaChanDoanChinh,
                GhiChu = diagnosis.GhiChu,
                CreatedAt = diagnosis.CreatedAt,
                TenICD = diagnosis.ICD?.TenICD ?? string.Empty
            };
        }
    }
}