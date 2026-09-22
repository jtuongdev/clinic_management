using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayLuotKhamDangXuLyQuery : IRequest<List<LuotKhamDangXuLyDto>>
    {
        public int? MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
    }
}