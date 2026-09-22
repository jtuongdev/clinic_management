using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.BenhNhan.Queries
{
    public class LayDanhSachBenhNhanDaXoaQuery : IRequest<IReadOnlyList<BenhNhanDto>> { }
}