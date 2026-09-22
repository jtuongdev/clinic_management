using MediatR;
using ClinicManagement.Application.DTOs.LuotKham.Examination;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayChiTietKhamQuery : IRequest<ExaminationDetailResponseDto>
    {
        public int LuotKhamId { get; set; }
    }
}