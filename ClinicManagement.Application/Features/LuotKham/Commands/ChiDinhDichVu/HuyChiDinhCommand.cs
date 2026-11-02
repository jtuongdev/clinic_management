using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class HuyChiDinhCommand : IRequest<ChiDinhDichVuDto>
    {
        public int ChiDinhId { get; set; }
        public int DeletedBy { get; set; }
        public string? LyDo { get; set; }
    }
}
