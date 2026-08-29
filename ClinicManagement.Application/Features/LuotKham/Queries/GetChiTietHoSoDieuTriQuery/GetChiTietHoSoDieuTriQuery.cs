using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetChiTietHoSoDieuTriQuery : IRequest<HoSoDieuTriDto?>
    {
        public int LuotKhamId { get; set; }
    }
}
