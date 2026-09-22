// Application/Features/BenhNhan/Queries/GetBenhNhanProfile/LayHoSoBenhNhanQuery.cs
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayHoSoBenhNhanQuery : IRequest<BenhNhanProfileDto>
    {
        public int Id { get; set; }
    }
}