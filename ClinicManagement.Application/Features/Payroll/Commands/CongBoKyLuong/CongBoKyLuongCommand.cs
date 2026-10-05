using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record CongBoKyLuongCommand(int Id) : IRequest<PayrollPeriodDto>;
public sealed record HuyPublishKyLuongCommand(int Id) : IRequest<PayrollPeriodDto>;

public sealed class CongBoKyLuongHandler(
    IPayrollRepository repository,
    ClinicManagement.Application.Common.Interfaces.IEmailSender emailSender,
    Microsoft.Extensions.Logging.ILogger<CongBoKyLuongHandler> logger)
    : PayrollTransitionHandler(repository),
      IRequestHandler<CongBoKyLuongCommand, PayrollPeriodDto>
{
    public async Task<PayrollPeriodDto> Handle(
        CongBoKyLuongCommand command,
        CancellationToken cancellationToken)
    {
        var result = await Transition(command.Id, payroll => payroll.Publish(), cancellationToken);

        // Gửi email phiếu lương tự động cho các nhân viên trong kỳ lương
        _ = Task.Run(async () =>
        {
            try
            {
                var periodDetail = await repository.GetPeriodAsync(command.Id, includeLines: true, CancellationToken.None);
                if (periodDetail?.BangLuongs == null) return;

                foreach (var bl in periodDetail.BangLuongs)
                {
                    if (string.IsNullOrWhiteSpace(bl.NhanVien?.Email)) continue;

                    var payslipData = new ClinicManagement.Application.Common.Notifications.Templates.PayslipEmailData
                    {
                        TenNhanVien = bl.NhanVien.HoTen,
                        MaNhanVien = $"NV{bl.NhanVien.Id:D4}",
                        ChucVu = bl.NhanVien.ChucVu?.TenChucVu ?? "Nhân viên",
                        Thang = periodDetail.Thang,
                        Nam = periodDetail.Nam,
                        LuongCoBan = bl.LuongCoBan,
                        PhuCap = bl.TongPhuCap,
                        TienTruc = bl.TienTangCa,
                        Thuong = bl.TongThuLaoHis,
                        KhauTru = bl.TongKhauTru,
                        ThucLinh = bl.ThucLinh,
                        SoNgayCong = bl.SoNgayCong,
                    };

                    var emailNotification = new ClinicManagement.Application.Common.Notifications.Templates.PayslipEmail(payslipData);
                    await emailSender.SendEmailAsync(
                        bl.NhanVien.Email,
                        emailNotification.Subject,
                        emailNotification.BuildHtmlBody(),
                        cancellationToken: CancellationToken.None);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi gửi email phiếu lương kỳ #{Id}", command.Id);
            }
        }, CancellationToken.None);

        return result;
    }
}

public sealed class HuyPublishKyLuongHandler(IPayrollRepository repository)
    : PayrollTransitionHandler(repository),
      IRequestHandler<HuyPublishKyLuongCommand, PayrollPeriodDto>
{
    public Task<PayrollPeriodDto> Handle(
        HuyPublishKyLuongCommand command,
        CancellationToken cancellationToken)
        => Transition(command.Id, payroll => payroll.Unpublish(), cancellationToken);
}
