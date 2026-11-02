using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;
using System;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayDanhSachLuotKhamQuery : IRequest<PagedResult<LuotKhamListDto>>
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int? MaBenhNhan { get; set; }
        public int? MaBacSi { get; set; }
        public int? MaKhoa { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SortBy { get; set; }
        public bool SortDesc { get; set; } = true;
    }
}