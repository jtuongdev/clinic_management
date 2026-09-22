using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.Features.Billing;
using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.CompleteExam;

public sealed class HoanThanhKhamCommandHandler(
    ILuotKhamRepository luotKhamRepository,
    IHoaDonRepository hoaDonRepository)
    : IRequestHandler<HoanThanhKhamCommand, HoaDonDetailDto?>
{
    public async Task<HoaDonDetailDto?> Handle(
        HoanThanhKhamCommand request, CancellationToken cancellationToken)
    {
        var visit = await luotKhamRepository.GetForCompletionAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.Id}.");

        if (string.IsNullOrWhiteSpace(visit.LyDoKham))
            throw new InvalidOperationException("Bắt buộc phải nhập lý do khám trước khi hoàn tất lượt khám.");

        if (visit.TrangThai != TrangThaiLuotKham.DANG_KHAM)
            throw new InvalidOperationException("Lượt khám phải đang ở trạng thái ĐANG_KHAM để hoàn tất.");

        var hasDiagnosis = visit.ChanDoans.Any(x => x.LaChanDoanChinh || !string.IsNullOrWhiteSpace(x.MaICD));
        if (!hasDiagnosis)
            throw new InvalidOperationException("Bắt buộc phải có ít nhất 1 chẩn đoán chính (ICD-10) trước khi hoàn tất lượt khám.");

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
            if (prescription.TrangThai == TrangThaiDonThuoc.TAM)
            {
                prescription.Approve();
            }

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
