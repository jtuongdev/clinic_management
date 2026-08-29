using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetThongTinBenhNhanTrongLuotKhamQuery : IRequest<ThongTinBenhNhanTrongLuotKhamDto?>
    {
        public int LuotKhamId { get; set; }
    }
}
