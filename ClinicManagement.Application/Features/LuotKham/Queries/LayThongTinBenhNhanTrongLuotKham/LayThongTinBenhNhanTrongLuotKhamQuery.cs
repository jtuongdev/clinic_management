using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayThongTinBenhNhanTrongLuotKhamQuery : IRequest<ThongTinBenhNhanTrongLuotKhamDto?>
    {
        public int LuotKhamId { get; set; }
    }
}
