using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Queries.DanhSachPhieuNhap;

public sealed record DanhSachPhieuNhapQuery(
    string? Keyword,
    TrangThaiPhieuNhap? Status,
    DateTime? FromDate,
    DateTime? ToDate,
    int PageIndex,
    int PageSize,
    int UserId) : IRequest<InventoryResult>;
