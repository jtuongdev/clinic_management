using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record CreateNghiPhepCommand(CreateNghiPhepRequest Request) : IRequest<NghiPhepDto>;
    public record ReviewNghiPhepCommand(int Id, int ReviewerId, bool Approved, string? Note) : IRequest<NghiPhepDto>;
    public record CancelNghiPhepCommand(int Id) : IRequest<NghiPhepDto>;
    public record GetNghiPhepQuery(DateTime FromDate, DateTime ToDate, int? MaNhanVien = null, string? TrangThai = null) : IRequest<IReadOnlyList<NghiPhepDto>>;

    internal static class NghiPhepMapper
    {
        public static NghiPhepDto Map(NghiPhep x) =>
        new() { Id = x.Id, MaNhanVien = x.MaNhanVien, TenNhanVien = x.NhanVien?.HoTen ?? string.Empty, TuNgay = x.TuNgay, DenNgay = x.DenNgay, LoaiNghi = x.LoaiNghi.ToString(), LyDo = x.LyDo, TrangThai = x.TrangThai.ToString(), NgayDuyet = x.NgayDuyet };
    }

    public class CreateNghiPhepHandler : IRequestHandler<CreateNghiPhepCommand, NghiPhepDto>
    {
        private readonly INghiPhepRepository repository;
        public CreateNghiPhepHandler(INghiPhepRepository repository) => this.repository = repository;
        public async Task<NghiPhepDto> Handle(CreateNghiPhepCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            if (!Enum.TryParse<LoaiNghiPhep>(request.LoaiNghi, true, out var leaveType))
                throw new ArgumentException("Loại nghỉ không hợp lệ.");
            var leave = new NghiPhep { MaNhanVien = request.MaNhanVien, TuNgay = request.TuNgay, DenNgay = request.DenNgay, LoaiNghi = leaveType, LyDo = request.LyDo?.Trim() ?? string.Empty };
            leave.ValidateDates();
            if (await repository.HasApprovedOverlapAsync(leave.MaNhanVien, leave.TuNgay, leave.DenNgay, cancellationToken: cancellationToken)) throw new InvalidOperationException("Khoảng nghỉ đã trùng với đơn được duyệt.");
            await repository.AddAsync(leave, cancellationToken);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return NghiPhepMapper.Map(await repository.GetByIdAsync(leave.Id, cancellationToken) ?? leave);
        }
    }

    public class ReviewNghiPhepHandler : IRequestHandler<ReviewNghiPhepCommand, NghiPhepDto>
    {
        private readonly INghiPhepRepository repository;
        private readonly ILichLamViecRepository scheduleRepository;
        private readonly IChamCongRepository attendanceRepository;
        public ReviewNghiPhepHandler(INghiPhepRepository repository, ILichLamViecRepository scheduleRepository, IChamCongRepository attendanceRepository)
        {
            this.repository = repository;
            this.scheduleRepository = scheduleRepository;
            this.attendanceRepository = attendanceRepository;
        }
        public async Task<NghiPhepDto> Handle(ReviewNghiPhepCommand command, CancellationToken cancellationToken)
        {
            var leave = await repository.GetByIdAsync(command.Id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy đơn nghỉ phép.");
            if (command.Approved) leave.Approve(command.ReviewerId); else leave.Reject(command.ReviewerId, command.Note ?? string.Empty);
            repository.Update(leave);
            if (command.Approved)
            {
                await scheduleRepository.MarkApprovedLeaveAsync(leave.MaNhanVien, leave.TuNgay, leave.DenNgay, cancellationToken);
                await attendanceRepository.MarkApprovedLeaveAsync(leave.MaNhanVien, leave.TuNgay, leave.DenNgay, cancellationToken);
            }
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return NghiPhepMapper.Map(leave);
        }
    }

    public class CancelNghiPhepHandler : IRequestHandler<CancelNghiPhepCommand, NghiPhepDto>
    {
        private readonly INghiPhepRepository repository;
        private readonly ILichLamViecRepository scheduleRepository;
        private readonly IChamCongRepository attendanceRepository;
        public CancelNghiPhepHandler(INghiPhepRepository repository, ILichLamViecRepository scheduleRepository, IChamCongRepository attendanceRepository)
        {
            this.repository = repository;
            this.scheduleRepository = scheduleRepository;
            this.attendanceRepository = attendanceRepository;
        }
        public async Task<NghiPhepDto> Handle(CancelNghiPhepCommand command, CancellationToken cancellationToken)
        {
            var leave = await repository.GetByIdAsync(command.Id, cancellationToken) ?? throw new KeyNotFoundException("Không tìm thấy đơn nghỉ phép.");
            var wasApproved = leave.TrangThai == TrangThaiNghiPhep.DA_DUYET;
            leave.Cancel();
            repository.Update(leave);
            if (wasApproved)
            {
                await scheduleRepository.RestoreCancelledLeaveAsync(leave.MaNhanVien, leave.TuNgay, leave.DenNgay, cancellationToken);
                await attendanceRepository.RestoreCancelledLeaveAsync(leave.MaNhanVien, leave.TuNgay, leave.DenNgay, cancellationToken);
            }
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return NghiPhepMapper.Map(leave);
        }
    }

    public class GetNghiPhepHandler : IRequestHandler<GetNghiPhepQuery, IReadOnlyList<NghiPhepDto>>
    {
        private readonly INghiPhepRepository repository;
        public GetNghiPhepHandler(INghiPhepRepository repository) => this.repository = repository;
        public async Task<IReadOnlyList<NghiPhepDto>> Handle(GetNghiPhepQuery request, CancellationToken cancellationToken) => (await repository.GetAsync(request.FromDate, request.ToDate, request.MaNhanVien, request.TrangThai, cancellationToken)).Select(NghiPhepMapper.Map).ToList();
    }
}
