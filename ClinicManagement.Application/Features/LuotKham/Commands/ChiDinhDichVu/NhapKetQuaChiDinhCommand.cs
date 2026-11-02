using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class NhapKetQuaChiDinhCommand : IRequest<ChiDinhDichVuDto>
    {
        public int ChiDinhId { get; set; }
        public int UpdatedBy { get; set; }
        public NhapKetQuaChiDinhRequest Data { get; set; } = null!;
    }
}
