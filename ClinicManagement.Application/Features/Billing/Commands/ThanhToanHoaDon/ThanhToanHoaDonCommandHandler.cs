using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed class ThanhToanHoaDonCommandHandler(IHoaDonRepository repository)
    : IRequestHandler<ThanhToanHoaDonCommand, HoaDonDetailDto>
{
    public async Task<HoaDonDetailDto> Handle(
        ThanhToanHoaDonCommand request,
        CancellationToken cancellationToken)
    {
        var invoice = await repository.GetByIdAsync(request.InvoiceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy hóa đơn {request.InvoiceId}.");

        // Tự động kiểm tra và áp dụng BHYT nếu có thẻ hợp lệ mà chưa được trừ
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
                }
            }
        }

        var collectorId = request.UserId > 0 ? request.UserId : (invoice.CreatedBy ?? 1);

        invoice.RecordPayment(request.Request.SoTien, request.Request.PhuongThuc, collectorId, request.Request.GhiChu);
        repository.Update(invoice);
        await repository.SaveChangesAsync(cancellationToken);

        return BillingMapper.ToDetail(invoice);
    }
}
