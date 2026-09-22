using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public record CapNhatVaiTroNhanVienCommand(int EmployeeId, UpdateEmployeeRolesRequest Request) : IRequest;
}
