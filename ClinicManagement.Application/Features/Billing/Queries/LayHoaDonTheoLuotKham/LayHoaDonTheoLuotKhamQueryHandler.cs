using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayHoaDonTheoLuotKhamQueryHandler(IHoaDonRepository repository)
    : IRequestHandler<LayHoaDonTheoLuotKhamQuery, HoaDonDetailDto?>
{
    public async Task<HoaDonDetailDto?> Handle(LayHoaDonTheoLuotKhamQuery request, CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByLuotKhamAsync(request.VisitId, cancellationToken);
        if (invoice is null) return null;

        if (invoice.SoTienBaoHiemChiTra == 0 && invoice.TongTien > 0 && invoice.TrangThai == TrangThaiHoaDon.CHO_THANH_TOAN)
        {
            var examDate = invoice.NgayLap != default ? invoice.NgayLap.Date : DateTime.UtcNow.Date;
            var activeInsurance = invoice.BenhNhan?.BaoHiems?
                .Where(b => b.IsValidAt(examDate) && b.MucHuong > 0)
                .OrderByDescending(b => b.MucHuong)
                .FirstOrDefault();

            if (activeInsurance != null)
            {
                var tyLe = Math.Clamp(activeInsurance.MucHuong, 0m, 100m) / 100m;
                var soTienBaoHiem = Math.Round(invoice.TongTien * tyLe, 0);
                if (soTienBaoHiem > 0)
                {
                    invoice.ApplyInsurance(soTienBaoHiem);
                    repository.Update(invoice);
                    await repository.SaveChangesAsync(cancellationToken);
                }
            }
        }

        return BillingMapper.ToDetail(invoice);
    }
}
