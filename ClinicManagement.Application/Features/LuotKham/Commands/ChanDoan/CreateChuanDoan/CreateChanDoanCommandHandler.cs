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
    public class CreateChanDoanCommandHandler : IRequestHandler<CreateChanDoanCommand, ChanDoanDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public CreateChanDoanCommandHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<ChanDoanDto> Handle(CreateChanDoanCommand request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Id lượt khám không hợp lệ.");

            if (request.Data == null || string.IsNullOrWhiteSpace(request.Data.MaICD))
                throw new ArgumentException("Mã ICD là bắt buộc.");

            if (string.IsNullOrWhiteSpace(request.Data.TenChanDoan))
                throw new ArgumentException("Tên chẩn đoán là bắt buộc.");

            var luotKham = await _luotKhamRepository.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám với Id = {request.LuotKhamId}");

            if (luotKham.TrangThai != TrangThaiLuotKham.DANG_KHAM)
                throw new InvalidOperationException("Chỉ được thêm chẩn đoán khi lượt khám đang ở trạng thái đang khám.");

            var maICD = request.Data.MaICD.Trim();
            var tenChanDoan = request.Data.TenChanDoan.Trim();
            var ghiChu = request.Data.GhiChu?.Trim() ?? string.Empty;

            var activeDiagnoses = luotKham.ChanDoans?.Where(x => !x.IsDeleted).ToList() ?? [];

            // Kiểm tra trùng mã ICD
            if (activeDiagnoses.Any(x => x.MaICD.Equals(maICD, StringComparison.OrdinalIgnoreCase)))
                throw new InvalidOperationException("Mã ICD đã tồn tại trong lượt khám này.");

            // Chỉ được một chẩn đoán chính
            if (request.Data.LaChanDoanChinh && activeDiagnoses.Any(x => x.LaChanDoanChinh))
                throw new InvalidOperationException("Lượt khám chỉ được có một chẩn đoán chính.");

            // Thêm mới
            luotKham.AddChanDoan(maICD, tenChanDoan, request.Data.LaChanDoanChinh, ghiChu, request.CreatedBy);

            _luotKhamRepository.Update(luotKham);
            await _luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

            var diagnosis = luotKham.ChanDoans?
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefault()
                ?? throw new InvalidOperationException("Không thể tạo chẩn đoán mới.");

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