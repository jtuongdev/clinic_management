using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.Features.Billing;
using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.CompleteExam;

public sealed class CompleteExamCommandHandler(
    ILuotKhamRepository luotKhamRepository,
    IHoaDonRepository hoaDonRepository)
    : IRequestHandler<CompleteExamCommand, HoaDonDetailDto?>
{
    public async Task<HoaDonDetailDto?> Handle(
        CompleteExamCommand request, CancellationToken cancellationToken)
    {
        var visit = await luotKhamRepository.GetForCompletionAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.Id}.");

        var existing = visit.HoaDons.FirstOrDefault(h => h.TrangThai != TrangThaiHoaDon.DA_HUY);
        if (existing is not null)
            return BillingMapper.ToDetail(existing);

        visit.CompleteExam();
        var invoice = new HoaDon(
            visit.Id, visit.MaBenhNhan, visit.MaCoSo,
            $"HD-{DateTime.UtcNow:yyyyMMddHHmmssfff}", request.UserId);

        foreach (var service in visit.ChiDinhDichVus.Where(s => s.TrangThai != TrangThaiChiDinhDichVu.DaHuy))
        {
            invoice.AddServiceOrDrug(
                "DICH_VU", service.MaDanhMuc,
                service.DanhMucDichVu?.Ten ?? $"Dịch vụ {service.MaDanhMuc}",
                1, service.DanhMucDichVu?.Gia ?? 0);
        }

        foreach (var prescription in visit.DonThuocs)
        {
            foreach (var line in prescription.ChiTietDonThuocs)
            {
                invoice.AddServiceOrDrug(
                    "THUOC", line.MaItem, $"Thuốc {line.MaItem}",
                    line.SoLuongKe, line.DonGiaKe);
            }
        }

        if (invoice.TongTien <= 0)
        {
            await luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return null;
        }

        invoice.CongNoBenhNhan = new CongNoBenhNhan
        {
            MaBenhNhan = visit.MaBenhNhan,
            SoTienNo = invoice.SoTienBenhNhanChiTra,
            SoTienDaTra = 0,
            HanThanhToan = DateTime.UtcNow.Date.AddDays(30),
            TrangThai = TrangThaiCongNo.DANG_NO,
            CreatedBy = request.UserId
        };

        await hoaDonRepository.AddAsync(invoice, cancellationToken);
        await luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return BillingMapper.ToDetail(invoice);
    }
}
