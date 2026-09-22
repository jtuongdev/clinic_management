using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayDanhSachPhieuThuQueryHandler(IHoaDonRepository repository)
    : IRequestHandler<LayDanhSachPhieuThuQuery, IReadOnlyList<PhieuThuDto>>
{
    public async Task<IReadOnlyList<PhieuThuDto>> Handle(
        LayDanhSachPhieuThuQuery request, CancellationToken cancellationToken)
        => (await repository.GetByIdAsync(request.InvoiceId, cancellationToken))?.PhieuThus
            .Select(payment => new PhieuThuDto
            {
                Id = payment.Id,
                SoPhieuThu = payment.SoPhieuThu,
                SoTien = payment.SoTien,
                NgayThu = payment.NgayThu,
                PhuongThuc = payment.PhuongThuc.ToString(),
                NguoiThu = payment.NguoiThu?.HoTen ?? string.Empty,
                GhiChu = payment.GhiChu
            }).ToList() ?? [];
}
