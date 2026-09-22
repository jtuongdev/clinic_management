using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public record CapNhatNhanVienCommand(int Id, UpdateNhanVienRequest Request) : IRequest<NhanVienDetailDto>;
}
