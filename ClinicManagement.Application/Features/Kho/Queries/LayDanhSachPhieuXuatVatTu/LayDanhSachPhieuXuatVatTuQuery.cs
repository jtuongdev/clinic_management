using System;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDanhSachPhieuXuatVatTu;

public sealed record LayDanhSachPhieuXuatVatTuQuery(
    int? KhoId,
    string? LoaiXuat,
    string? Keyword,
    DateTime? FromDate,
    DateTime? ToDate,
    int PageIndex,
    int PageSize,
    int UserId) : KhoRequest(UserId);
