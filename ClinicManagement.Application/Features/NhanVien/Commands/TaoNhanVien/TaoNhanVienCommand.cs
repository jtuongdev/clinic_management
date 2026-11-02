using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public record TaoNhanVienCommand(CreateNhanVienRequest Request) : IRequest<NhanVienDetailDto>;
}
