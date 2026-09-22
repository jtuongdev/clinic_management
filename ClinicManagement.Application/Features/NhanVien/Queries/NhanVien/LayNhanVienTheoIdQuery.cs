using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public record LayNhanVienTheoIdQuery(int Id) : IRequest<NhanVienDetailDto?>;
}
