using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public record SetNhanVienStatusCommand(int Id, bool IsActive) : IRequest;
}
