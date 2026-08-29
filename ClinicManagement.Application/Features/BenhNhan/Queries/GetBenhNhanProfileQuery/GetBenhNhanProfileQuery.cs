// Application/Features/BenhNhan/Queries/GetBenhNhanProfile/GetBenhNhanProfileQuery.cs
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetBenhNhanProfileQuery : IRequest<BenhNhanProfileDto>
    {
        public int Id { get; set; }
    }
}