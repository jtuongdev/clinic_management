using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Billing;

public sealed class LayTongQuanCongNoNhaCungCapQueryHandler(IKhoRepository repository)
    : IRequestHandler<LayTongQuanCongNoNhaCungCapQuery, TongQuanCongNoNhaCungCapDto>
{
    public async Task<TongQuanCongNoNhaCungCapDto> Handle(
        LayTongQuanCongNoNhaCungCapQuery request,
        CancellationToken cancellationToken)
    {
        var query = repository.PhieuNhapKhos
            .AsNoTracking()
            .Where(p => !p.IsDeleted && p.TrangThai == TrangThaiPhieuNhap.DA_NHAP);

        if (request.FacilityId > 0)
        {
            query = query.Where(p => p.MaCoSo == request.FacilityId);
        }

        var receipts = await query
            .Select(p => new
            {
                p.MaNhaCungCap,
                p.NgayNhap,
                p.TongTien,
                p.GhiChu
            })
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        decimal totalDebt = 0;
        decimal totalOverdue = 0;
        decimal totalPaid = 0;
        int unpaidCount = 0;
        int overdueCount = 0;
        var suppliersWithDebt = new HashSet<int>();

        foreach (var r in receipts)
        {
            var paid = SupplierPaymentHelper.ParsePaidAmount(r.GhiChu);
            var remaining = Math.Max(0, r.TongTien - paid);
            var dueDate = r.NgayNhap.AddDays(30);
            var isOverdue = now.Date > dueDate.Date && remaining > 0;

            totalPaid += paid;
            totalDebt += remaining;

            if (remaining > 0)
            {
                unpaidCount++;
                suppliersWithDebt.Add(r.MaNhaCungCap);
            }

            if (isOverdue)
            {
                overdueCount++;
                totalOverdue += remaining;
            }
        }

        return new TongQuanCongNoNhaCungCapDto
        {
            TongCongNo = totalDebt,
            TongNoQuaHan = totalOverdue,
            TongDaThanhToan = totalPaid,
            SoPhieuChuaThanhToan = unpaidCount,
            SoPhieuQuaHan = overdueCount,
            SoNhaCungCapConNo = suppliersWithDebt.Count,
            TongSoPhieu = receipts.Count
        };
    }
}
