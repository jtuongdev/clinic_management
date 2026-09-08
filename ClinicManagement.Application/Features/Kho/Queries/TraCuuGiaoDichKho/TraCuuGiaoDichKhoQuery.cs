using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

public sealed record TraCuuGiaoDichKhoQuery(int? ItemId, DateTime? FromDate, DateTime? ToDate, int PageIndex, int PageSize, int UserId) : KhoRequest(UserId);
