using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public record CreateNhanVienCommand(CreateNhanVienRequest Request) : IRequest<NhanVienDetailDto>;
}
