using ClinicManagement.Application.Common.Interfaces;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatNoiBo;

public sealed record LayDanhSachPhieuXuatNoiBoQuery(
    int? MaKhoa,
    string? TrangThai,
    DateTime? TuNgay,
    DateTime? DenNgay,
    int PageIndex,
    int PageSize,
    int UserId) : IRequest<InventoryResult>;
