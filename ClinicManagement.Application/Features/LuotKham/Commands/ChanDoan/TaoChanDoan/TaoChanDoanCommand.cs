using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class TaoChanDoanCommand : IRequest<ChanDoanDto>
    {
        public int LuotKhamId { get; set; }
        public int CreatedBy { get; set; }
        public ChanDoanRequest Data { get; set; } = null!; 
    }
}