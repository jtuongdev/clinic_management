using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record LayTonKhoQuery(
    string? Keyword,
    bool LowStockOnly,
    int PageIndex,
    int PageSize,
    int UserId,
    int? KhoId = null,
    string? StockStatus = null) : KhoRequest(UserId);
