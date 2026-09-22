using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayBenhNhanTheoIdQuery : IRequest<BenhNhanDto>
    {
        public int Id { get; set; }
    }
}