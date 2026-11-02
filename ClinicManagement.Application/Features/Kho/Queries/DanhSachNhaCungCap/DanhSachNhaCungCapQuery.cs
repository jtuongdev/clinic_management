using ClinicManagement.Domain.Common.Enums;
using MediatR;
using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Queries.DanhSachNhaCungCap;

public sealed record DanhSachNhaCungCapQuery(string? Keyword, TrangThaiNhaCungCap? Status, int PageIndex, int PageSize, int UserId) : KhoRequest(UserId);
