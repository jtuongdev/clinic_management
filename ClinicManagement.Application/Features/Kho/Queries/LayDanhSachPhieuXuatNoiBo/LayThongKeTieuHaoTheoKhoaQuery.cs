using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatNoiBo;

public sealed record LayThongKeTieuHaoTheoKhoaQuery(
    int? MaKhoa,
    DateTime TuNgay,
    DateTime DenNgay,
    int UserId) : IRequest<InventoryResult>;
