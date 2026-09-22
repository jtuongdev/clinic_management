using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayThongKeLuotKhamQuery : IRequest<LuotKhamStatsDto>
    {
        public int? MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
    }
}