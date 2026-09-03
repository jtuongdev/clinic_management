using ClinicManagement.Application.DTOs.LuotKham;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class CreateChiDinhDichVuCommand : IRequest<ChiDinhDichVuDto>
    {
        public int LuotKhamId { get; set; }
        public int CreatedBy { get; set; }
        public ChiDinhDichVuRequest Data { get; set; } = null!;
    }
}
