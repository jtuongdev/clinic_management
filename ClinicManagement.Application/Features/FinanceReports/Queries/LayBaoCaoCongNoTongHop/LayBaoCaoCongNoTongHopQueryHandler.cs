using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.Billing;
using ClinicManagement.Application.DTOs.FinanceReports;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.FinanceReports.Queries.LayBaoCaoCongNoTongHop;

public sealed class LayBaoCaoCongNoTongHopQueryHandler(
    IHoaDonRepository hoaDonRepo,
    IKhoRepository khoRepo)
    : IRequestHandler<LayBaoCaoCongNoTongHopQuery, BaoCaoCongNoResponseDto>
{
    public async Task<BaoCaoCongNoResponseDto> Handle(
        LayBaoCaoCongNoTongHopQuery request,
        CancellationToken cancellationToken)
    {
        var now = request.AsOfDate ?? DateTime.UtcNow;

        // 1. Công nợ phải thu (Bệnh nhân)
        var patientDebtsQuery = hoaDonRepo.GetCongNoQueryable()
            .AsNoTracking()
            .Where(c => !c.IsDeleted && c.SoTienNo > c.SoTienDaTra);

        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
        {
            patientDebtsQuery = patientDebtsQuery.Where(c => c.HoaDon != null && c.HoaDon.MaCoSo == request.FacilityId.Value);
        }

        var patientDebtsRaw = await patientDebtsQuery.ToListAsync(cancellationToken);

        decimal tongPhaiThu = 0;
        decimal phaiThuTrongHan = 0;
        decimal phaiThuQuaHan = 0;

        decimal bnAge30 = 0;
        decimal bnAge60 = 0;
        decimal bnAge90 = 0;
        decimal bnAgeOver90 = 0;

        var topPatientsList = new List<TopBenhNhanNoDto>();

        foreach (var c in patientDebtsRaw)
        {
            var remaining = Math.Max(0, c.SoTienNo - c.SoTienDaTra);
            if (remaining <= 0) continue;

            tongPhaiThu += remaining;

            var dueDate = c.HanThanhToan ?? c.CreatedAt.AddDays(30);
            var isOverdue = now.Date > dueDate.Date;

            if (isOverdue)
            {
                phaiThuQuaHan += remaining;
            }
            else
            {
                phaiThuTrongHan += remaining;
            }

            var days = Math.Max(0, (now.Date - dueDate.Date).Days);
            if (days <= 30) bnAge30 += remaining;
            else if (days <= 60) bnAge60 += remaining;
            else if (days <= 90) bnAge90 += remaining;
            else bnAgeOver90 += remaining;

            topPatientsList.Add(new TopBenhNhanNoDto
            {
                MaBenhNhan = c.MaBenhNhan,
                HoTen = c.BenhNhan != null ? $"{c.BenhNhan.Ho} {c.BenhNhan.Ten}".Trim() : $"BN #{c.MaBenhNhan}",
                SoDienThoai = c.BenhNhan?.DienThoai ?? string.Empty,
                SoTienNo = c.SoTienNo,
                SoTienDaTra = c.SoTienDaTra,
                SoTienConLai = remaining,
                HanThanhToan = c.HanThanhToan,
                SoNgayQuaHan = isOverdue ? days : 0,
                TrangThai = isOverdue ? "Quá hạn" : "Đang nợ"
            });
        }

        // 2. Công nợ phải trả (Nhà cung cấp)
        var supplierDebtsQuery = khoRepo.PhieuNhapKhos
            .AsNoTracking()
            .Include(p => p.NhaCungCap)
            .Where(p => !p.IsDeleted && p.TrangThai == TrangThaiPhieuNhap.DA_NHAP);

        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
        {
            supplierDebtsQuery = supplierDebtsQuery.Where(p => p.MaCoSo == request.FacilityId.Value);
        }

        var supplierDebtsRaw = await supplierDebtsQuery.ToListAsync(cancellationToken);

        decimal tongPhaiTra = 0;
        decimal phaiTraTrongHan = 0;
        decimal phaiTraQuaHan = 0;

        decimal nccAge30 = 0;
        decimal nccAge60 = 0;
        decimal nccAge90 = 0;
        decimal nccAgeOver90 = 0;

        var topSuppliersList = new List<TopNhaCungCapNoDto>();
        var supplierIdsWithDebt = new HashSet<int>();

        foreach (var p in supplierDebtsRaw)
        {
            var paid = SupplierPaymentHelper.ParsePaidAmount(p.GhiChu);
            var remaining = Math.Max(0, p.TongTien - paid);
            if (remaining <= 0) continue;

            tongPhaiTra += remaining;
            supplierIdsWithDebt.Add(p.MaNhaCungCap);

            var dueDate = p.NgayNhap.AddDays(30);
            var isOverdue = now.Date > dueDate.Date;

            if (isOverdue)
            {
                phaiTraQuaHan += remaining;
            }
            else
            {
                phaiTraTrongHan += remaining;
            }

            var days = Math.Max(0, (now.Date - dueDate.Date).Days);
            if (days <= 30) nccAge30 += remaining;
            else if (days <= 60) nccAge60 += remaining;
            else if (days <= 90) nccAge90 += remaining;
            else nccAgeOver90 += remaining;

            topSuppliersList.Add(new TopNhaCungCapNoDto
            {
                MaNhaCungCap = p.MaNhaCungCap,
                MaNcc = p.NhaCungCap?.Ma ?? string.Empty,
                TenNhaCungCap = p.NhaCungCap?.Ten ?? $"NCC #{p.MaNhaCungCap}",
                SoDienThoai = p.NhaCungCap?.DienThoai,
                TongTienHang = p.TongTien,
                SoTienDaTra = paid,
                SoTienConLai = remaining,
                HanThanhToan = dueDate,
                SoNgayQuaHan = isOverdue ? days : 0,
                TrangThai = isOverdue ? "Quá hạn" : "Đang nợ"
            });
        }

        // 3. Phân bổ tuổi nợ (Aging buckets)
        var phanBoTuoiNo = new List<PhanBoTuoiNoDto>
        {
            new()
            {
                NhomTuoi = "Dưới 30 ngày",
                SoTienPhaiThu = bnAge30,
                SoTienPhaiTra = nccAge30,
                TyTrongPhaiThu = tongPhaiThu > 0 ? Math.Round((double)bnAge30 / (double)tongPhaiThu * 100, 1) : 0,
                TyTrongPhaiTra = tongPhaiTra > 0 ? Math.Round((double)nccAge30 / (double)tongPhaiTra * 100, 1) : 0
            },
            new()
            {
                NhomTuoi = "31 - 60 ngày",
                SoTienPhaiThu = bnAge60,
                SoTienPhaiTra = nccAge60,
                TyTrongPhaiThu = tongPhaiThu > 0 ? Math.Round((double)bnAge60 / (double)tongPhaiThu * 100, 1) : 0,
                TyTrongPhaiTra = tongPhaiTra > 0 ? Math.Round((double)nccAge60 / (double)tongPhaiTra * 100, 1) : 0
            },
            new()
            {
                NhomTuoi = "61 - 90 ngày",
                SoTienPhaiThu = bnAge90,
                SoTienPhaiTra = nccAge90,
                TyTrongPhaiThu = tongPhaiThu > 0 ? Math.Round((double)bnAge90 / (double)tongPhaiThu * 100, 1) : 0,
                TyTrongPhaiTra = tongPhaiTra > 0 ? Math.Round((double)nccAge90 / (double)tongPhaiTra * 100, 1) : 0
            },
            new()
            {
                NhomTuoi = "Trên 90 ngày",
                SoTienPhaiThu = bnAgeOver90,
                SoTienPhaiTra = nccAgeOver90,
                TyTrongPhaiThu = tongPhaiThu > 0 ? Math.Round((double)bnAgeOver90 / (double)tongPhaiThu * 100, 1) : 0,
                TyTrongPhaiTra = tongPhaiTra > 0 ? Math.Round((double)nccAgeOver90 / (double)tongPhaiTra * 100, 1) : 0
            }
        };

        return new BaoCaoCongNoResponseDto
        {
            TongQuan = new TongQuanCongNoDto
            {
                TongPhaiThuBenhNhan = tongPhaiThu,
                PhaiThuTrongHan = phaiThuTrongHan,
                PhaiThuQuaHan = phaiThuQuaHan,
                TongPhaiTraNhaCungCap = tongPhaiTra,
                PhaiTraTrongHan = phaiTraTrongHan,
                PhaiTraQuaHan = phaiTraQuaHan,
                ChenhLechCongNo = tongPhaiThu - tongPhaiTra,
                SoBenhNhanNo = topPatientsList.Select(x => x.MaBenhNhan).Distinct().Count(),
                SoNhaCungCapNo = supplierIdsWithDebt.Count
            },
            PhanBoTuoiNo = phanBoTuoiNo,
            TopBenhNhanNo = topPatientsList.OrderByDescending(x => x.SoTienConLai).Take(10).ToList(),
            TopNhaCungCapNo = topSuppliersList.OrderByDescending(x => x.SoTienConLai).Take(10).ToList()
        };
    }
}
