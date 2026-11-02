using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public record CapNhatTrangThaiNhanVienCommand(int Id, bool IsActive) : IRequest;
}
