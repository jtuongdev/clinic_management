using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class XoaChanDoanCommand : IRequest
    {
        public int LuotKhamId { get; set; }
        public int ChanDoanId { get; set; }
        public int DeletedBy { get; set; }
    }
}
