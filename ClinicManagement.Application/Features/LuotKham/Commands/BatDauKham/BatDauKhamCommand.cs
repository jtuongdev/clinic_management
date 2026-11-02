using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class BatDauKhamCommand : IRequest<StartExamResultDto>
    {
        public int Id { get; set; }
        public int MaBacSi { get; set; }
    }
}
