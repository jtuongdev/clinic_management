using MediatR;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class AdminDoiMatKhauBenhNhanCommand : IRequest<bool>
    {
        public int PatientId { get; set; }
        public string NewPassword { get; set; } = string.Empty;
        public int UpdatedBy { get; set; }
    }
}
