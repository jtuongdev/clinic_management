using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record CheckInCommand(int MaNhanVien) : IRequest<ChamCongDto>;
    public record CheckOutCommand(int MaNhanVien) : IRequest<ChamCongDto>;
    public record GetChamCongQuery(DateTime FromDate, DateTime ToDate, int? MaNhanVien = null) : IRequest<IReadOnlyList<ChamCongDto>>;

    public class CheckInHandler : IRequestHandler<CheckInCommand, ChamCongDto>
    {
        private readonly IChamCongRepository repository;
        public CheckInHandler(IChamCongRepository repository) => this.repository = repository;
        public async Task<ChamCongDto> Handle(CheckInCommand request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var existing = await repository.GetByEmployeeDateAsync(request.MaNhanVien, now.Date, cancellationToken);
            if (existing != null) throw new InvalidOperationException("Nhân viên đã check-in trong ngày hôm nay.");
            var attendance = new ChamCong { MaNhanVien = request.MaNhanVien, NgayChamCong = now.Date };
            attendance.CheckInAt(now);
            await repository.AddAsync(attendance, cancellationToken);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return Map(attendance);
        }
        internal static ChamCongDto Map(ChamCong x) => new() { Id = x.Id, MaNhanVien = x.MaNhanVien, TenNhanVien = x.NhanVien?.HoTen ?? string.Empty, NgayChamCong = x.NgayChamCong, CheckIn = x.CheckIn, CheckOut = x.CheckOut, TrangThai = x.TrangThai, GhiChu = x.GhiChu };
    }

    public class CheckOutHandler : IRequestHandler<CheckOutCommand, ChamCongDto>
    {
        private readonly IChamCongRepository repository;
        public CheckOutHandler(IChamCongRepository repository) => this.repository = repository;
        public async Task<ChamCongDto> Handle(CheckOutCommand request, CancellationToken cancellationToken)
        {
            var attendance = await repository.GetByEmployeeDateAsync(request.MaNhanVien, DateTime.UtcNow.Date, cancellationToken) ?? throw new KeyNotFoundException("Chưa có bản ghi check-in hôm nay.");
            attendance.CheckOutAt(DateTime.UtcNow);
            repository.Update(attendance);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return CheckInHandler.Map(attendance);
        }
    }

    public class GetChamCongHandler : IRequestHandler<GetChamCongQuery, IReadOnlyList<ChamCongDto>>
    {
        private readonly IChamCongRepository repository;
        public GetChamCongHandler(IChamCongRepository repository) => this.repository = repository;
        public async Task<IReadOnlyList<ChamCongDto>> Handle(GetChamCongQuery request, CancellationToken cancellationToken)
        {
            var items = await repository.GetByDateRangeAsync(request.FromDate, request.ToDate, request.MaNhanVien, cancellationToken);
            return items.Select(CheckInHandler.Map).ToList();
        }
    }
}
