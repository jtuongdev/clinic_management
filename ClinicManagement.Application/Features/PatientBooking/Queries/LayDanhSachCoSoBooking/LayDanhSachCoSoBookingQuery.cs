using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.PatientBooking;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.PatientBooking.Queries.LayDanhSachCoSoBooking
{
    public class LayDanhSachCoSoBookingQuery : IRequest<List<BookingFacilityDto>>
    {
    }

    public class LayDanhSachCoSoBookingQueryHandler : IRequestHandler<LayDanhSachCoSoBookingQuery, List<BookingFacilityDto>>
    {
        private readonly ICoSoRepository _coSoRepo;

        public LayDanhSachCoSoBookingQueryHandler(ICoSoRepository coSoRepo)
        {
            _coSoRepo = coSoRepo;
        }

        public async Task<List<BookingFacilityDto>> Handle(LayDanhSachCoSoBookingQuery request, CancellationToken cancellationToken)
        {
            var coSos = await _coSoRepo.GetAllAsync();

            return coSos
                .Where(c => !c.IsDeleted && (string.IsNullOrEmpty(c.TrangThai) || c.TrangThai == "HOAT_DONG" || c.TrangThai == "ACTIVE"))
                .OrderBy(c => c.Ten)
                .Select(c => new BookingFacilityDto
                {
                    Id = c.Id,
                    Ma = c.Ma,
                    Ten = c.Ten,
                    DiaChi = c.DiaChi,
                    DienThoai = c.DienThoai,
                    Email = c.Email
                })
                .ToList();
        }
    }
}
