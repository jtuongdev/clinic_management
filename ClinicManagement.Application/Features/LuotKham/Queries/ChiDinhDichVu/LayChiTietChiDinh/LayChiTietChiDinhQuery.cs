using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries.ChiDinhDichVu
{
    public class LayChiTietChiDinhQuery : IRequest<ChiDinhDichVuChiTietDto>
    {
        public int ChiDinhId { get; set; }
    }
}
