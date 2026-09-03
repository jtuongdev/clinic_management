using System.Collections.Generic;
using ClinicManagement.Application.DTOs.LuotKham;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries.DanhMucDichVu
{
    public class GetDanhMucDichVuListQuery : IRequest<List<DanhMucDichVuDto>>
    {
        public string? LoaiDichVu { get; set; }
    }
}
