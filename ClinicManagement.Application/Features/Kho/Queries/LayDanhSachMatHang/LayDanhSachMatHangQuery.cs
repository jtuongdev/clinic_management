using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record LayDanhSachMatHangQuery(string? Keyword, LoaiItem? ItemType, bool? IsActive, int PageIndex, int PageSize, int UserId) : KhoRequest(UserId);
