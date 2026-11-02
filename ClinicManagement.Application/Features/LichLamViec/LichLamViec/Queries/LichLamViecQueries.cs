using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record GetLichLamViecQuery(DateTime FromDate, DateTime ToDate, int? MaNhanVien = null, int? MaKhoa = null)
        : IRequest<IReadOnlyList<LichLamViecDto>>;

    public class GetLichLamViecHandler : IRequestHandler<GetLichLamViecQuery, IReadOnlyList<LichLamViecDto>>
    {
        private readonly ILichLamViecRepository repository;
        public GetLichLamViecHandler(ILichLamViecRepository repository) => this.repository = repository;

        public async Task<IReadOnlyList<LichLamViecDto>> Handle(GetLichLamViecQuery query, CancellationToken cancellationToken)
        {
            if (query.ToDate.Date < query.FromDate.Date)
                throw new ArgumentException("Khoảng ngày không hợp lệ.");
            var result = await repository.GetByDateRangeAsync(query.FromDate, query.ToDate, query.MaNhanVien, query.MaKhoa, cancellationToken);
            return result.Select(CreateLichLamViecHandler.Map).ToList();
        }
    }
}