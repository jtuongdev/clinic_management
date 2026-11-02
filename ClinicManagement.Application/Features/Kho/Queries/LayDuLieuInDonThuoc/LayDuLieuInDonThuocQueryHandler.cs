using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho.CapPhat;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDuLieuInDonThuoc;

public sealed class LayDuLieuInDonThuocQueryHandler(
    IKhoRepository db)
    : IRequestHandler<LayDuLieuInDonThuocQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(LayDuLieuInDonThuocQuery request, CancellationToken ct)
    {
        if (request.PrescriptionId <= 0)
            return InventoryResult.Error("Mã đơn thuốc không hợp lệ.");

        var prescription = await db.DonThuocs.AsNoTracking()
            .Include(x => x.LuotKham).ThenInclude(x => x.BenhNhan)
            .Include(x => x.LuotKham).ThenInclude(x => x.ChanDoans)
            .Include(x => x.BacSi)
            .Include(x => x.CoSo)
            .Include(x => x.NguoiCapThuoc)
            .Include(x => x.ChiTietDonThuocs).ThenInclude(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == request.PrescriptionId, ct);

        if (prescription is null)
            return InventoryResult.Error("Không tìm thấy đơn thuốc.", 404);

        if (prescription.TrangThai != TrangThaiDonThuoc.DA_XUAT_HET || !prescription.NgayCapThuoc.HasValue || !prescription.MaNguoiCapThuoc.HasValue)
            return InventoryResult.Error("Đơn thuốc chưa hoàn tất cấp phát.", 409);

        var export = await db.PhieuXuatKhos.AsNoTracking()
            .Include(x => x.KhoXuat)
            .Include(x => x.NguoiXuat)
            .Include(x => x.ChiTietXuatKhos).ThenInclude(x => x.ChiTietNhapKho).ThenInclude(x => x.Item)
            .Where(x => x.MaDonThuoc == request.PrescriptionId && x.LoaiXuat == LoaiXuatKho.XUAT_DON)
            .OrderByDescending(x => x.NgayXuat).ThenByDescending(x => x.Id)
            .FirstOrDefaultAsync(ct);

        if (export is null || export.ChiTietXuatKhos.Count == 0)
            return InventoryResult.Error("Không tìm thấy phiếu xuất cấp phát của đơn thuốc.", 409);

        var patient = prescription.LuotKham.BenhNhan;
        var diagnosis = prescription.LuotKham.ChanDoans.OrderByDescending(x => x.LaChanDoanChinh).ThenBy(x => x.Id).FirstOrDefault();
        var facility = prescription.CoSo;
        var dispenser = prescription.NguoiCapThuoc ?? export.NguoiXuat;

        var items = prescription.ChiTietDonThuocs.OrderBy(x => x.Id).Select((line, index) =>
        {
            var batches = export.ChiTietXuatKhos
                .Where(x => x.ChiTietNhapKho.MaItem == line.MaItem)
                .OrderBy(x => x.Id)
                .Select(x => new PrescriptionPrintBatchDto(x.ChiTietNhapKho.SoLo, x.ChiTietNhapKho.HanSuDung, x.SoLuongXuat))
                .ToList();
            return new PrescriptionPrintItemDto(
                index + 1, line.Item.Ma, line.Item.Ten, line.Item.DangBaoChe,
                line.SoLuongDaXuat, VietnameseQuantity(line.SoLuongDaXuat), line.Item.DonViTinhCoBan,
                batches, BuildUsageInstruction(line.LieuDung, line.TanSuat, line.SoNgay, line.HuongDan));
        }).ToList();

        var printData = new PrescriptionPrintDto(
            new PrescriptionPrintHeaderDto(
                "Sở Y Tế TP. Hồ Chí Minh",
                new PrescriptionPrintFacilityDto(facility.Ten, facility.DiaChi, facility.DienThoai),
                $"DT-{prescription.NgayKe.Year}-{prescription.Id:D5}",
                $"LK-{prescription.MaLuotKham:D3}",
                $"BN-{patient.Id:D5}",
                "ĐƠN THUỐC",
                "Kèm thông tin xuất kho cấp phát"),
            new PrescriptionPrintPatientDto(
                $"{patient.Ho} {patient.Ten}".Trim(),
                CalculateAge(patient.NgaySinh, prescription.NgayKe),
                PatientGender(patient.GioiTinh),
                patient.SoCCCD, patient.DienThoai, patient.DiaChi),
            new PrescriptionPrintDiagnosisDto(diagnosis?.MaICD ?? string.Empty, diagnosis?.TenChanDoan ?? string.Empty),
            items,
            PrescriptionNotes(prescription.GhiChu),
            new PrescriptionPrintConfirmationDto(
                prescription.NgayKe,
                new PrescriptionPrintDoctorDto(prescription.BacSi.HoTen, prescription.BacSi.SoHanhNghe),
                new PrescriptionPrintDispenserDto(dispenser.HoTen, "ĐÃ CẤP PHÁT")),
            new[] { "Khám lại xin mang theo đơn này.", "Thuốc đã xuất khỏi quầy xin vui lòng kiểm tra kỹ trước khi rời đi." });

        return InventoryResult.Ok(printData);
    }

    private static string BuildUsageInstruction(string lieuDung, string tanSuat, int? soNgay, string huongDan)
    {
        var parts = new[] { lieuDung, tanSuat, soNgay.HasValue ? $"{soNgay} ngày" : string.Empty, huongDan }
            .Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim());
        return string.Join(", ", parts);
    }

    private static IReadOnlyList<string> PrescriptionNotes(string note)
        => string.IsNullOrWhiteSpace(note)
            ? Array.Empty<string>()
            : note.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries).Select(x => x.Trim()).Where(x => x.Length > 0).ToArray();

    private static int CalculateAge(DateTime dob, DateTime referenceDate)
    {
        var age = referenceDate.Year - dob.Year;
        if (referenceDate.Date < dob.Date.AddYears(age)) age--;
        return Math.Max(0, age);
    }

    private static string PatientGender(ClinicManagement.Domain.Common.Enums.GioiTinh gender)
        => gender switch { ClinicManagement.Domain.Common.Enums.GioiTinh.M => "Nam", ClinicManagement.Domain.Common.Enums.GioiTinh.F => "Nữ", _ => "Khác" };

    private static string VietnameseQuantity(decimal quantity)
        => quantity == decimal.Truncate(quantity)
            ? VietnameseInteger((long)quantity)
            : quantity.ToString("0.##", System.Globalization.CultureInfo.InvariantCulture);

    private static string VietnameseInteger(long value)
        => value switch { 0 => "Không", 1 => "Một", 2 => "Hai", 3 => "Ba", 4 => "Bốn", 5 => "Năm", 6 => "Sáu", 7 => "Bảy", 8 => "Tám", 9 => "Chín", 10 => "Mười", _ => value.ToString(System.Globalization.CultureInfo.InvariantCulture) };
}
