using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayDanhSachDonThuocQuery : IRequest<PagedResult<DonThuocListDto>>
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int? MaKhoa { get; set; }
        public int? MaBacSi { get; set; }
        public int? MaBenhNhan { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}