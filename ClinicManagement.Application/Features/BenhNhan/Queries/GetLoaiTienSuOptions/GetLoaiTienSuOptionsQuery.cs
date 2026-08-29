using System.Collections.Generic;
using ClinicManagement.Application.DTOs.BenhNhan;
using MediatR;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class GetLoaiTienSuOptionsQuery : IRequest<List<LoaiTienSuOptionDto>>
    {
    }
}
