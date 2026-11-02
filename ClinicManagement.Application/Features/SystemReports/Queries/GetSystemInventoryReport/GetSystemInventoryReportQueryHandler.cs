using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.SystemReports;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.SystemReports.Queries.GetSystemInventoryReport;

public sealed class GetSystemInventoryReportQueryHandler(IKhoRepository khoRepo)
    : IRequestHandler<GetSystemInventoryReportQuery, SystemReportsInventoryDto>
{
    public async Task<SystemReportsInventoryDto> Handle(
        GetSystemInventoryReportQuery request,
        CancellationToken cancellationToken)
    {
        var totalSkus = await khoRepo.Items.AsNoTracking().CountAsync(cancellationToken);
        var totalStockValue = await khoRepo.TonKhos.AsNoTracking()
            .Include(t => t.ChiTietNhapKho)
            .SumAsync(t => (decimal?)(t.SoLuongTon * t.ChiTietNhapKho.DonGiaNhap), cancellationToken) ?? 0;

        // Thuốc dưới định mức an toàn
        var lowStockList = await khoRepo.TonKhos.AsNoTracking()
            .Include(t => t.Item)
            .Include(t => t.Kho)
            .Where(t => t.Item.TonToiThieu > 0 && t.SoLuongTon <= t.Item.TonToiThieu)
            .Select(t => new LowStockItemDto
            {
                ItemId = t.MaItem,
                ItemName = t.Item.Ten,
                ItemCode = t.Item.Ma,
                CurrentStock = t.SoLuongTon,
                MinStock = t.Item.TonToiThieu,
                Unit = t.Item.DonViTinhCoBan,
                Warehouse = t.Kho.TenKho
            })
            .Take(15)
            .ToListAsync(cancellationToken);

        // Thuốc sắp hết hạn trong 90 ngày
        var limitDate = DateTime.UtcNow.AddDays(90);
        var expiringList = await khoRepo.TonKhos.AsNoTracking()
            .Include(t => t.Item)
            .Include(t => t.Kho)
            .Include(t => t.ChiTietNhapKho)
            .Where(t => t.ChiTietNhapKho.HanSuDung.HasValue && t.ChiTietNhapKho.HanSuDung.Value <= limitDate && t.SoLuongTon > 0)
            .OrderBy(t => t.ChiTietNhapKho.HanSuDung)
            .Select(t => new ExpiringBatchDto
            {
                ItemId = t.MaItem,
                ItemName = t.Item.Ten,
                BatchNumber = t.ChiTietNhapKho.SoLo,
                ExpiryDate = t.ChiTietNhapKho.HanSuDung,
                Stock = t.SoLuongTon,
                Warehouse = t.Kho.TenKho
            })
            .Take(15)
            .ToListAsync(cancellationToken);

        // Top 10 thuốc được kê đơn nhiều nhất
        var topDispensed = await khoRepo.ChiTietDonThuocs.AsNoTracking()
            .Include(ct => ct.Item)
            .Include(ct => ct.DonThuoc)
            .Where(ct => ct.DonThuoc.TrangThai == TrangThaiDonThuoc.DA_XUAT_HET || ct.DonThuoc.TrangThai == TrangThaiDonThuoc.DA_DUYET)
            .GroupBy(ct => new { ct.MaItem, ct.Item.Ten, ct.Item.DonViTinhCoBan })
            .Select(g => new TopDispensedMedicineDto
            {
                Id = g.Key.MaItem,
                Name = g.Key.Ten,
                Unit = g.Key.DonViTinhCoBan,
                Quantity = g.Sum(x => x.SoLuongKe),
                TotalRevenue = g.Sum(x => x.SoLuongKe * x.DonGiaKe)
            })
            .OrderByDescending(x => x.Quantity)
            .Take(10)
            .ToListAsync(cancellationToken);

        return new SystemReportsInventoryDto
        {
            Kpis = new SystemReportsInventoryKpisDto
            {
                TotalSkus = totalSkus,
                TotalStockValue = totalStockValue,
                LowStockCount = lowStockList.Count,
                ExpiringCount = expiringList.Count
            },
            LowStockList = lowStockList,
            ExpiringList = expiringList,
            TopDispensed = topDispensed
        };
    }
}
