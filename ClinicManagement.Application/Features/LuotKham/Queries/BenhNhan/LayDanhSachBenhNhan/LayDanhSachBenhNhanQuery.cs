using MediatR;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.LuotKham;
using System;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayDanhSachBenhNhanQuery : IRequest<PagedResult<BenhNhanListDto>>
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Keyword { get; set; }
        public string? TrangThai { get; set; }
        public int? MaKhoa { get; set; }
        public int? MaCoSo { get; set; }
    }
}