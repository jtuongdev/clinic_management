using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayLuotKhamTheoIdQuery : IRequest<LuotKhamDetailDto>
    {
        public int Id { get; set; }
    }
}