using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.System;
using ClinicManagement.Application.Services.Interfaces;
using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.HoanThanhVaKhoaKham;

public sealed class HoanThanhVaKhoaKhamCommandHandler(
    ILuotKhamRepository luotKhamRepository,
    IHoaDonRepository hoaDonRepository,
    IClinicalGovernanceService governanceService)
    : IRequestHandler<HoanThanhVaKhoaKhamCommand, HoanThanhVaKhoaKhamResultDto>
{
    public async Task<HoanThanhVaKhoaKhamResultDto> Handle(
        HoanThanhVaKhoaKhamCommand request,
        CancellationToken cancellationToken)
    {
        var visit = await luotKhamRepository.GetForCompletionAsync(request.LuotKhamId, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.LuotKhamId}.");

        // 1. Thẩm định điều kiện lâm sàng trước khi hoàn tất
        var validation = await governanceService.ValidateClinicalRecordCompletionAsync(request.LuotKhamId, cancellationToken);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"Lượt khám chưa đủ điều kiện hoàn tất: {string.Join("; ", validation.Errors)}");
        }

        // 2. Chuyển trạng thái sang HOAN_THANH nếu chưa hoàn tất
        if (visit.TrangThai != TrangThaiLuotKham.HOAN_THANH)
        {
            visit.CompleteExam();
        }

        // 3. Khóa hồ sơ bệnh án điện tử (EMR Lock)
        var signature = string.IsNullOrWhiteSpace(request.ChuKySo)
            ? $"SIG_{DateTime.UtcNow:yyyyMMddHHmmss}_{request.UserId}_{visit.Id}"
            : request.ChuKySo.Trim();

        if (!visit.EmrLocked)
        {
            visit.LockEmr(signature, request.UserId);
        }

        // 4. Duyệt các đơn thuốc ở trạng thái lưu tạm (TAM)
        foreach (var prescription in visit.DonThuocs)
        {
            if (prescription.TrangThai == TrangThaiDonThuoc.TAM)
            {
                prescription.Approve();
            }
        }

        // 5. Phát sinh Hóa đơn & Công nợ (Idempotent: nếu đã có thì giữ nguyên)
        var existingInvoice = visit.HoaDons.FirstOrDefault(h => h.TrangThai != TrangThaiHoaDon.DA_HUY);
        var invoice = existingInvoice;

        if (invoice is null)
        {
            invoice = new HoaDon(
                visit.Id, visit.MaBenhNhan, visit.MaCoSo,
                $"HD-{DateTime.UtcNow:yyyyMMddHHmmssfff}", request.UserId,
                $"Hóa đơn tự động lượt khám #{visit.Id}");

            foreach (var service in visit.ChiDinhDichVus.Where(s => s.TrangThai != TrangThaiChiDinhDichVu.DaHuy))
            {
                var serviceName = !string.IsNullOrWhiteSpace(service.DanhMucDichVu?.Ten)
                    ? service.DanhMucDichVu.Ten
                    : $"Dịch vụ {service.MaDanhMuc}";
                if (serviceName.Length > 250) serviceName = serviceName.Substring(0, 250);

                var giaDichVu = service.DanhMucDichVu?.Gia ?? 0;
                if (giaDichVu < 0) giaDichVu = 0;

                invoice.AddServiceOrDrug(
                    "DICH_VU", service.MaDanhMuc,
                    serviceName,
                    1, giaDichVu);
            }

            foreach (var prescription in visit.DonThuocs.Where(d => d.TrangThai != TrangThaiDonThuoc.HUY))
            {
                foreach (var line in prescription.ChiTietDonThuocs)
                {
                    if (line.SoLuongKe <= 0) continue;

                    var itemName = !string.IsNullOrWhiteSpace(line.Item?.Ten)
                        ? line.Item.Ten
                        : $"Thuốc #{line.MaItem}";
                    if (itemName.Length > 250) itemName = itemName.Substring(0, 250);

                    var donGia = line.DonGiaKe < 0 ? 0 : line.DonGiaKe;

                    invoice.AddServiceOrDrug(
                        "THUOC", line.MaItem, itemName,
                        line.SoLuongKe, donGia);
                }
            }

            if (invoice.TongTien > 0)
            {
                invoice.CongNoBenhNhan = new CongNoBenhNhan
                {
                    HoaDon = invoice,
                    MaBenhNhan = visit.MaBenhNhan,
                    SoTienNo = invoice.SoTienBenhNhanChiTra,
                    SoTienDaTra = 0,
                    HanThanhToan = DateTime.UtcNow.Date.AddDays(30),
                    TrangThai = TrangThaiCongNo.DANG_NO,
                    CreatedBy = request.UserId
                };

                await hoaDonRepository.AddAsync(invoice, cancellationToken);
            }
            else if (invoice.ChiTietHoaDons.Count > 0)
            {
                await hoaDonRepository.AddAsync(invoice, cancellationToken);
            }
        }

        // 6. Lưu toàn bộ thay đổi trong một đơn vị công việc duy nhất
        // Lưu ý: visit đã được nạp có tracking, KHÔNG gọi luotKhamRepository.Update(visit)
        // để tránh EF Core đánh dấu Modified hàng loạt trên các entity catalog/liên kết.
        await luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

        // 6. Ghi nhật ký kiểm toán bệnh án điện tử (Audit Log)
        try
        {
            await governanceService.WriteAuditLogAsync(new CreateEmrAuditLogRequest(
                visit.MaBenhNhan,
                visit.Id,
                request.UserId,
                "SIGN_AND_COMPLETE",
                "EMR",
                string.Empty,
                request.LyDo ?? "Hoàn tất ca khám và ký số EMR nguyên khối"
            ), cancellationToken);
        }
        catch
        {
            // Không làm gián đoạn luồng nghiệp vụ chính nếu ghi log audit gặp sự cố
        }

        return new HoanThanhVaKhoaKhamResultDto
        {
            LuotKhamId = visit.Id,
            TrangThai = visit.TrangThai.ToString(),
            EmrLocked = visit.EmrLocked,
            ChuKySo = visit.EmrSignature ?? signature,
            EmrLockedAt = visit.EmrLockedAt,
            HoaDonId = invoice?.Id,
            SoHoaDon = invoice?.SoHoaDon ?? string.Empty,
            TongTien = invoice?.TongTien ?? 0,
            Message = "Hoàn tất lượt khám và ký số hồ sơ bệnh án thành công."
        };
    }
}
