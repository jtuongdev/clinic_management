using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.PatientBooking;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.PatientBooking.Queries.LayDanhSachChuyenKhoaBooking
{
    public class LayDanhSachChuyenKhoaBookingQuery : IRequest<List<BookingSpecialtyDto>>
    {
        public int? MaCoSo { get; set; }
    }

    public class LayDanhSachChuyenKhoaBookingQueryHandler : IRequestHandler<LayDanhSachChuyenKhoaBookingQuery, List<BookingSpecialtyDto>>
    {
        private readonly IKhoaRepository _khoaRepo;

        public LayDanhSachChuyenKhoaBookingQueryHandler(IKhoaRepository khoaRepo)
        {
            _khoaRepo = khoaRepo;
        }

        public async Task<List<BookingSpecialtyDto>> Handle(LayDanhSachChuyenKhoaBookingQuery request, CancellationToken cancellationToken)
        {
            var khoas = await _khoaRepo.GetKhoasWithDetailsAsync(request.MaCoSo, cancellationToken);

            return khoas
                .Where(k => !k.IsDeleted)
                .OrderBy(k => k.Ten)
                .Select(k => new BookingSpecialtyDto
                {
                    Id = k.Id,
                    Ma = k.Ma,
                    Ten = k.Ten,
                    MaCoSo = k.MaCoSo,
                    TenCoSo = k.CoSo?.Ten,
                    IconUrl = null,
                    MoTa = $"Chuyên khoa {k.Ten}"
                })
                .ToList();
        }
    }
}
