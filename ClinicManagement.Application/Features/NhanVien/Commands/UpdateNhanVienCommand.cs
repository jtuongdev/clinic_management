using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public record UpdateNhanVienCommand(int Id, UpdateNhanVienRequest Request) : IRequest<NhanVienDetailDto>;
}
