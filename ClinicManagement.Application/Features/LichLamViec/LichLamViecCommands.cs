using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record CreateLichLamViecCommand(CreateLichLamViecRequest Request) : IRequest<LichLamViecDto>;
    public record UpdateLichLamViecCommand(int Id, UpdateLichLamViecRequest Request) : IRequest<LichLamViecDto>;
    public record DeleteLichLamViecCommand(int Id, int DeletedBy) : IRequest;

    public class CreateLichLamViecHandler : IRequestHandler<CreateLichLamViecCommand, LichLamViecDto>
    {
        private readonly ILichLamViecRepository repository;
        public CreateLichLamViecHandler(ILichLamViecRepository repository) => this.repository = repository;

        public async Task<LichLamViecDto> Handle(CreateLichLamViecCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            if (request.MaNhanVien <= 0 || request.MaCaTruc <= 0) throw new ArgumentException("Nhân viên và ca làm việc không hợp lệ.");
            if (await repository.HasConflictAsync(request.MaNhanVien, request.MaCaTruc, request.NgayLam, cancellationToken: cancellationToken))
                throw new InvalidOperationException("Nhân viên đã có lịch trùng hoặc chồng ca trong thời gian này.");

            var entity = new Domain.Identity.LichLamViec
            {
                MaNhanVien = request.MaNhanVien,
                MaCaTruc = request.MaCaTruc,
                NgayLam = request.NgayLam.Date,
                GhiChu = request.GhiChu?.Trim() ?? string.Empty
            };
            entity.Normalize();
            await repository.AddAsync(entity, cancellationToken);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            var result = await repository.GetByIdAsync(entity.Id, cancellationToken) ?? entity;
            return Map(result);
        }

        internal static LichLamViecDto Map(Domain.Identity.LichLamViec item) => new()
        {
            Id = item.Id, MaNhanVien = item.MaNhanVien, TenNhanVien = item.NhanVien?.HoTen ?? string.Empty,
            MaCaTruc = item.MaCaTruc, TenCa = item.CaTruc?.TenCa ?? string.Empty, NgayLam = item.NgayLam,
            ThoiGianBatDau = item.CaTruc?.ThoiGianBatDau ?? TimeSpan.Zero,
            ThoiGianKetThuc = item.CaTruc?.ThoiGianKetThuc ?? TimeSpan.Zero,
            SoGioLam = item.CaTruc?.SoGioLam ?? 0, GhiChu = item.GhiChu
        };
    }

    public class UpdateLichLamViecHandler : IRequestHandler<UpdateLichLamViecCommand, LichLamViecDto>
    {
        private readonly ILichLamViecRepository repository;
        public UpdateLichLamViecHandler(ILichLamViecRepository repository) => this.repository = repository;
        public async Task<LichLamViecDto> Handle(UpdateLichLamViecCommand command, CancellationToken cancellationToken)
        {
            var entity = await repository.GetByIdAsync(command.Id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy lịch làm việc.");
            var request = command.Request;
            if (await repository.HasConflictAsync(entity.MaNhanVien, request.MaCaTruc, request.NgayLam, command.Id, cancellationToken))
                throw new InvalidOperationException("Nhân viên đã có lịch trùng hoặc chồng ca trong thời gian này.");
            entity.MaCaTruc = request.MaCaTruc;
            entity.NgayLam = request.NgayLam.Date;
            entity.GhiChu = request.GhiChu?.Trim() ?? string.Empty;
            repository.Update(entity);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return CreateLichLamViecHandler.Map(await repository.GetByIdAsync(command.Id, cancellationToken) ?? entity);
        }
    }

    public class DeleteLichLamViecHandler : IRequestHandler<DeleteLichLamViecCommand>
    {
        private readonly ILichLamViecRepository repository;
        public DeleteLichLamViecHandler(ILichLamViecRepository repository) => this.repository = repository;
        public async Task Handle(DeleteLichLamViecCommand command, CancellationToken cancellationToken)
        {
            var entity = await repository.GetByIdAsync(command.Id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy lịch làm việc.");
            repository.SoftDelete(entity, command.DeletedBy);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
