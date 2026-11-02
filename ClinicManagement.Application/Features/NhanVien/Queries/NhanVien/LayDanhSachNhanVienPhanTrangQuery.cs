using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.NhanVien;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class LayDanhSachNhanVienPhanTrangQuery : IRequest<PagedResult<NhanVienListDto>>
    {
        public string? Keyword { get; init; }
        public int? MaChucVu { get; init; }
        public bool? IsActive { get; init; }
        public int? MaKhoa { get; init; }
        public DateTime? Ngay { get; init; }
        public int PageIndex { get; init; } = 1;
        public int PageSize { get; init; } = 20;
    }
}
