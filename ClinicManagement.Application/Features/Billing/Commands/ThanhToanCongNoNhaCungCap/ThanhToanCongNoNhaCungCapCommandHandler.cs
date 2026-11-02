using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Billing;

public sealed class ThanhToanCongNoNhaCungCapCommandHandler(IKhoRepository repository)
    : IRequestHandler<ThanhToanCongNoNhaCungCapCommand, CongNoNhaCungCapDto>
{
    public async Task<CongNoNhaCungCapDto> Handle(
        ThanhToanCongNoNhaCungCapCommand command,
        CancellationToken cancellationToken)
    {
        var req = command.Request;
        if (req.SoTienThanhToan <= 0)
        {
            throw new ArgumentException("Số tiền thanh toán phải lớn hơn 0.");
        }

        var receipt = await repository.PhieuNhapKhos
            .Include(p => p.NhaCungCap)
            .FirstOrDefaultAsync(p => p.Id == req.MaPhieuNhap && !p.IsDeleted, cancellationToken);

        if (receipt is null)
        {
            throw new KeyNotFoundException($"Không tìm thấy phiếu nhập kho với mã #{req.MaPhieuNhap}.");
        }

        if (receipt.TrangThai != TrangThaiPhieuNhap.DA_NHAP)
        {
            throw new InvalidOperationException("Chỉ có thể thanh toán cho phiếu nhập kho đã hoàn tất nhập hàng (Đã nhập).");
        }

        var paidSoFar = SupplierPaymentHelper.ParsePaidAmount(receipt.GhiChu);
        var remaining = Math.Max(0, receipt.TongTien - paidSoFar);

        if (remaining <= 0)
        {
            throw new InvalidOperationException("Khoản công nợ cho phiếu nhập này đã được tất toán.");
        }

        if (req.SoTienThanhToan > remaining)
        {
            throw new ArgumentException($"Số tiền thanh toán ({req.SoTienThanhToan:N0} ₫) vượt quá số tiền còn nợ ({remaining:N0} ₫).");
        }

        receipt.GhiChu = SupplierPaymentHelper.AppendPaymentRecord(
            receipt.GhiChu,
            req.SoTienThanhToan,
            string.IsNullOrWhiteSpace(req.PhuongThucThanhToan) ? "CHUYEN_KHOAN" : req.PhuongThucThanhToan,
            req.GhiChu);

        await repository.SaveChangesAsync(cancellationToken);

        var newPaid = paidSoFar + req.SoTienThanhToan;
        var newRemaining = Math.Max(0, receipt.TongTien - newPaid);
        var dueDate = receipt.NgayNhap.AddDays(30);
        var now = DateTime.UtcNow;
        var isOverdue = now.Date > dueDate.Date && newRemaining > 0;
        var isPaidOff = newRemaining <= 0;

        string statusKey = isPaidOff ? "DA_TAT_TOAN" : (isOverdue ? "QUA_HAN" : "DANG_NO");
        string statusName = isPaidOff ? "Đã tất toán" : (isOverdue ? "Quá hạn" : "Đang nợ");
        int overdueDays = isOverdue ? (int)(now.Date - dueDate.Date).TotalDays : 0;

        return new CongNoNhaCungCapDto
        {
            Id = receipt.Id,
            MaPhieuNhap = receipt.MaPhieu,
            MaNhaCungCap = receipt.MaNhaCungCap,
            MaNcc = receipt.NhaCungCap?.Ma ?? string.Empty,
            TenNhaCungCap = receipt.NhaCungCap?.Ten ?? string.Empty,
            SoDienThoai = receipt.NhaCungCap?.DienThoai,
            Email = receipt.NhaCungCap?.Email,
            DiaChi = receipt.NhaCungCap?.DiaChi,
            MaCoSo = receipt.MaCoSo,
            MaKho = receipt.MaKho,
            NgayNhap = receipt.NgayNhap,
            HanThanhToan = dueDate,
            TongTien = receipt.TongTien,
            SoTienDaTra = newPaid,
            SoTienConLai = newRemaining,
            TrangThai = statusKey,
            TrangThaiTen = statusName,
            SoNgayQuaHan = overdueDays,
            GhiChu = SupplierPaymentHelper.CleanGhiChu(receipt.GhiChu),
            LichSuThanhToan = SupplierPaymentHelper.ParsePaymentHistory(receipt.GhiChu)
        };
    }
}
