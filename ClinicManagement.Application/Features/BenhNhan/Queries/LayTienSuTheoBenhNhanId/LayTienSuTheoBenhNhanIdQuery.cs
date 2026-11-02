using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayTienSuTheoBenhNhanIdQuery : IRequest<IReadOnlyList<TienSuBenhDto>>
    {
        public int BenhNhanId { get; set; }
    }
}