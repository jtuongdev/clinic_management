using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record GetLichLamViecAdjustmentsQuery(int ScheduleId) : IRequest<IReadOnlyList<LichLamViecDieuChinhDto>>;
    public record CreateLichLamViecCommand(CreateLichLamViecRequest Request) : IRequest<LichLamViecDto>;
    public record UpdateLichLamViecCommand(int Id, UpdateLichLamViecRequest Request, int UpdatedBy = 0) : IRequest<LichLamViecDto>;
    public record DeleteLichLamViecCommand(int Id, int DeletedBy) : IRequest;

    public class CreateLichLamViecHandler : IRequestHandler<CreateLichLamViecCommand, LichLamViecDto>
    {
        private readonly ILichLamViecRepository repository;
        public CreateLichLamViecHandler(ILichLamViecRepository repository) => this.repository = repository;

        public async Task<LichLamViecDto> Handle(CreateLichLamViecCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            if (request.MaNhanVien <= 0 || request.MaKhoa <= 0 || request.MaCaTruc <= 0) throw new ArgumentException("Khoa, nhân viên và ca làm việc không hợp lệ.");
            if (request.NgayLam == default) throw new ArgumentException("Ngày làm việc không hợp lệ.");
            if (request.MaPhongKham is <= 0) throw new ArgumentException("Phòng khám không hợp lệ.");
            if (request.GhiChu?.Length > 500) throw new ArgumentException("Ghi chú không được vượt quá 500 ký tự.");
            if (!await repository.IsEmployeeAssignedToDepartmentAsync(request.MaNhanVien, request.MaKhoa, request.NgayLam, cancellationToken))
                throw new InvalidOperationException("Nhân viên không thuộc khoa tại ngày phân lịch.");
            if (await repository.HasConflictAsync(request.MaNhanVien, request.MaCaTruc, request.NgayLam, cancellationToken: cancellationToken))
                throw new InvalidOperationException("Nhân viên đã có lịch trùng hoặc chồng ca trong thời gian này.");

            if (!Enum.TryParse<TrangThaiLichLamViec>(request.TrangThai, true, out var status) ||
                !Enum.IsDefined(status))
                throw new ArgumentException("Trạng thái lịch làm việc không hợp lệ.");
            var entity = new Domain.Identity.LichLamViec
            {
                MaNhanVien = request.MaNhanVien,
                MaKhoa = request.MaKhoa,
                MaCaTruc = request.MaCaTruc,
                MaPhongKham = request.MaPhongKham,
                TrangThai = status,
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
            Id = item.Id, MaNhanVien = item.MaNhanVien, MaKhoa = item.MaKhoa, TenKhoa = item.Khoa?.Ten ?? string.Empty, TenNhanVien = item.NhanVien?.HoTen ?? string.Empty,
            MaCaTruc = item.MaCaTruc, TenCa = item.CaTruc?.TenCa ?? string.Empty, NgayLam = item.NgayLam,
            MaPhongKham = item.MaPhongKham, TenPhongKham = item.PhongKham?.Ten ?? string.Empty,
            MaLichLamViecCoDinh = item.MaLichLamViecCoDinh, NguonLich = item.NguonLich,
            TrangThai = item.TrangThai.ToString(),
            LaNghiTheoNgay = item.TrangThai == TrangThaiLichLamViec.NGHI,
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
            if (await repository.HasAttendanceAsync(entity.Id, cancellationToken))
                throw new InvalidOperationException("Không thể cập nhật lịch đã có chấm công.");
            if (await repository.IsPeriodLockedAsync(entity.NgayLam, cancellationToken) ||
                await repository.IsPeriodLockedAsync(command.Request.NgayLam, cancellationToken))
                throw new InvalidOperationException("Không thể cập nhật lịch thuộc kỳ chấm công đã bị khóa.");
            var request = command.Request;
            if (request.NgayLam == default) throw new ArgumentException("Ngày làm việc không hợp lệ.");
            if (request.MaPhongKham is <= 0) throw new ArgumentException("Phòng khám không hợp lệ.");
            if (request.GhiChu?.Length > 500) throw new ArgumentException("Ghi chú không được vượt quá 500 ký tự.");
            var adjustment = new Domain.Identity.LichLamViecDieuChinh
            {
                MaLichLamViec = entity.Id,
                CaCu = entity.MaCaTruc,
                PhongCu = entity.MaPhongKham,
                TrangThaiCu = entity.TrangThai.ToString(),
                NguoiThucHien = command.UpdatedBy,
                LyDo = request.GhiChu?.Trim() ?? string.Empty
            };
            if (request.MaCaTruc <= 0) throw new ArgumentException("Ca làm việc không hợp lệ.");
            if (!await repository.IsEmployeeAssignedToDepartmentAsync(entity.MaNhanVien, entity.MaKhoa, request.NgayLam, cancellationToken))
                throw new InvalidOperationException("Nhân viên không còn thuộc khoa tại ngày phân lịch.");
            if (await repository.HasConflictAsync(entity.MaNhanVien, request.MaCaTruc, request.NgayLam, command.Id, cancellationToken))
                throw new InvalidOperationException("Nhân viên đã có lịch trùng hoặc chồng ca trong thời gian này.");
            entity.MaCaTruc = request.MaCaTruc;
            entity.MaPhongKham = request.MaPhongKham;
            if (!Enum.TryParse<TrangThaiLichLamViec>(request.TrangThai, true, out var status) ||
                !Enum.IsDefined(status))
                throw new ArgumentException("Trạng thái lịch làm việc không hợp lệ.");
            entity.TrangThai = status;
            entity.NgayLam = request.NgayLam.Date;
            entity.GhiChu = request.GhiChu?.Trim() ?? string.Empty;
            adjustment.CaMoi = entity.MaCaTruc;
            adjustment.PhongMoi = entity.MaPhongKham;
            adjustment.TrangThaiMoi = entity.TrangThai.ToString();
            await repository.AddAdjustmentAsync(adjustment, cancellationToken);
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
            if (await repository.HasAttendanceAsync(entity.Id, cancellationToken))
                throw new InvalidOperationException("Không thể xóa lịch đã có chấm công.");
            if (await repository.IsPeriodLockedAsync(entity.NgayLam, cancellationToken))
                throw new InvalidOperationException("Không thể xóa lịch thuộc kỳ chấm công đã bị khóa.");
            repository.SoftDelete(entity, command.DeletedBy);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
