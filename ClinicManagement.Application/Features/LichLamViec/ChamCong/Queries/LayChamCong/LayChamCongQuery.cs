using ClinicManagement.Application.DTOs.LichLamViec;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record LayChamCongQuery(DateTime FromDate, DateTime ToDate, int? MaNhanVien = null, int? MaKhoa = null) : IRequest<IReadOnlyList<ChamCongDto>>;
