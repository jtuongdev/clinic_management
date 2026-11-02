using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayTienSuMoiNhatQuery : IRequest<TienSuBenhDto?>
    {
        public int BenhNhanId { get; set; }
    }
}