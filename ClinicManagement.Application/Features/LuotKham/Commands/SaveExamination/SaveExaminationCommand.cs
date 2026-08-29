using ClinicManagement.Application.DTOs.LuotKham.Examination;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class SaveExaminationCommand : IRequest<ExaminationResultDto>
    {
        public int LuotKhamId { get; set; }
        public int CreatedBy { get; set; }
        public SaveExaminationRequest ExaminationData { get; set; } = null!;
    }
}
