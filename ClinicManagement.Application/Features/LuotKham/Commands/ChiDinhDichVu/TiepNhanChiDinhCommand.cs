using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class TiepNhanChiDinhCommand : IRequest<ChiDinhDichVuDto>
    {
        public int ChiDinhId { get; set; }
        public int? MaNguoiThucHien { get; set; }
        public int UpdatedBy { get; set; }
        public string? GhiChu { get; set; }
    }
}
