using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.Common.Notifications.Templates;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ClinicManagement.Application.Features.Billing;

public sealed class ThanhToanHoaDonCommandHandler(
    IHoaDonRepository repository,
    IEmailSender emailSender,
    ILogger<ThanhToanHoaDonCommandHandler> logger)
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

        // Gửi email biên lai thu tiền nếu bệnh nhân có email
        if (!string.IsNullOrWhiteSpace(invoice.BenhNhan?.Email))
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    var emailData = new InvoiceEmailData
                    {
                        SoHoaDon = invoice.SoHoaDon,
                        TenBenhNhan = $"{invoice.BenhNhan.Ho} {invoice.BenhNhan.Ten}".Trim(),
                        TongTien = invoice.TongTien,
                        DaThanhToan = invoice.DaThanhToan,
                        ConLai = invoice.TongTien - invoice.SoTienBaoHiemChiTra - invoice.DaThanhToan,
                        PhuongThucThanhToan = request.Request.PhuongThuc.ToString(),
                        NgayThu = DateTime.Now,
                        Items = invoice.ChiTietHoaDons?.Select(c => new InvoiceItemEmailDto
                        {
                            TenDichVu = c.MoTa,
                            SoLuong = c.SoLuong,
                            DonGia = c.DonGia,
                        }).ToList() ?? new(),
                    };

                    var emailNotification = new InvoicePaymentEmail(emailData);
                    await emailSender.SendEmailAsync(
                        invoice.BenhNhan.Email,
                        emailNotification.Subject,
                        emailNotification.BuildHtmlBody(),
                        cancellationToken: CancellationToken.None);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Lỗi khi gửi email hóa đơn #{SoHoaDon}", invoice.SoHoaDon);
                }
            }, CancellationToken.None);
        }

        return BillingMapper.ToDetail(invoice);
    }
}
