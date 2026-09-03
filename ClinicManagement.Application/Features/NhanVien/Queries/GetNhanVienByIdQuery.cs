using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public record GetNhanVienByIdQuery(int Id) : IRequest<NhanVienDetailDto?>;
}
