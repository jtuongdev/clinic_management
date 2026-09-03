using ClinicManagement.Application.DTOs.LuotKham;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class UpdateChiDinhDichVuCommand : IRequest<ChiDinhDichVuDto>
    {
        public int LuotKhamId { get; set; }
        public int ChiDinhDichVuId { get; set; }
        public int UpdatedBy { get; set; }
        public ChiDinhDichVuRequest Data { get; set; } = null!;
    }
}
