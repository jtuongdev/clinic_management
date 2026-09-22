using ClinicManagement.Application.DTOs.LuotKham.ChanDoan;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class CapNhatChanDoanCommand : IRequest<ChanDoanDto>
    {
        public int LuotKhamId { get; set; }
        public int ChanDoanId { get; set; }
        public int UpdatedBy { get; set; }
        public ChanDoanRequest Data { get; set; } = null!; // Id không cần dùng
    }
}