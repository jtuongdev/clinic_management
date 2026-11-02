using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.SystemReports;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.SystemReports.Queries.ExportSystemReports;

public sealed class ExportSystemReportsQueryHandler(
    ILuotKhamRepository luotKhamRepo,
    IHoaDonRepository hoaDonRepo,
    IKhoRepository khoRepo)
    : IRequestHandler<ExportSystemReportsQuery, ExportSystemReportDto>
{
    public async Task<ExportSystemReportDto> Handle(
        ExportSystemReportsQuery request,
        CancellationToken cancellationToken)
    {
        var from = (request.FromDate ?? DateTime.UtcNow.AddDays(-30)).Date;
        var to = (request.ToDate ?? DateTime.UtcNow).Date.AddDays(1);
        var tab = (request.Tab ?? "overview").ToLowerInvariant();

        var sb = new StringBuilder();

        if (tab == "clinical" || tab == "overview")
        {
            sb.AppendLine("BÁO CÁO THỐNG KÊ LÂM SÀNG VÀ HOẠT ĐỘNG KHÁM CHỮA BỆNH");
            sb.AppendLine($"Thời gian: Từ {from:dd/MM/yyyy} đến {to.AddDays(-1):dd/MM/yyyy}");
            sb.AppendLine();
            sb.AppendLine("Mã lượt,Bệnh nhân,Bác sĩ,Khoa,Ngày khám,Trạng thái");

            var visitQuery = luotKhamRepo.GetQueryable().AsNoTracking()
                .Include(v => v.BenhNhan)
                .Include(v => v.BacSi)
                .Include(v => v.Khoa)
                .Where(v => v.NgayKham >= from && v.NgayKham < to);

            if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
                visitQuery = visitQuery.Where(v => v.MaCoSo == request.FacilityId.Value);
            if (request.DepartmentId.HasValue && request.DepartmentId.Value > 0)
                visitQuery = visitQuery.Where(v => v.MaKhoa == request.DepartmentId.Value);

            var visits = await visitQuery
                .OrderByDescending(v => v.NgayKham)
                .Take(500)
                .ToListAsync(cancellationToken);

            foreach (var v in visits)
            {
                var patientName = $"{v.BenhNhan.Ho} {v.BenhNhan.Ten}";
                var doctorName = v.BacSi?.HoTen ?? "Chưa chỉ định";
                var deptName = v.Khoa?.Ten ?? "--";
                sb.AppendLine($"\"{v.Id}\",\"{patientName}\",\"{doctorName}\",\"{deptName}\",\"{v.NgayKham:dd/MM/yyyy HH:mm}\",\"{v.TrangThai}\"");
            }
        }
        else if (tab == "finance")
        {
            sb.AppendLine("BÁO CÁO DOANH THU VÀ THU VIỆN PHÍ");
            sb.AppendLine($"Thời gian: Từ {from:dd/MM/yyyy} đến {to.AddDays(-1):dd/MM/yyyy}");
            sb.AppendLine();
            sb.AppendLine("Số hóa đơn,Bệnh nhân,Ngày lập,Tổng tiền,Đã thanh toán,BHYT chi trả,Còn nợ,Trạng thái");

            var invoiceQuery = hoaDonRepo.GetQueryable().AsNoTracking()
                .Include(h => h.BenhNhan)
                .Where(h => !h.IsDeleted && h.NgayLap >= from && h.NgayLap < to);

            if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
                invoiceQuery = invoiceQuery.Where(h => h.MaCoSo == request.FacilityId.Value);

            var invoices = await invoiceQuery
                .OrderByDescending(h => h.NgayLap)
                .Take(500)
                .ToListAsync(cancellationToken);

            foreach (var h in invoices)
            {
                var patient = $"{h.BenhNhan.Ho} {h.BenhNhan.Ten}";
                var remaining = h.SoTienBenhNhanChiTra - h.DaThanhToan;
                sb.AppendLine($"\"{h.SoHoaDon}\",\"{patient}\",\"{h.NgayLap:dd/MM/yyyy}\",{h.TongTien},{h.DaThanhToan},{h.SoTienBaoHiemChiTra},{remaining},\"{h.TrangThai}\"");
            }
        }
        else if (tab == "inventory")
        {
            sb.AppendLine("BÁO CÁO TỒN KHO VÀ DƯỢC PHẨM");
            sb.AppendLine($"Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}");
            sb.AppendLine();
            sb.AppendLine("Mã thuốc,Tên thuốc,Kho,Số lô,Hạn dùng,Số lượng tồn,Đơn vị,Giá nhập,Thành tiền");

            var stockQuery = khoRepo.TonKhos.AsNoTracking()
                .Include(t => t.Item)
                .Include(t => t.Kho)
                .Include(t => t.ChiTietNhapKho)
                .Where(t => t.SoLuongTon > 0);

            var stocks = await stockQuery
                .OrderBy(t => t.Item.Ten)
                .Take(500)
                .ToListAsync(cancellationToken);

            foreach (var s in stocks)
            {
                var price = s.ChiTietNhapKho?.DonGiaNhap ?? 0;
                var value = s.SoLuongTon * price;
                var expiry = s.ChiTietNhapKho?.HanSuDung?.ToString("dd/MM/yyyy") ?? "--";
                var batch = s.ChiTietNhapKho?.SoLo ?? "--";
                sb.AppendLine($"\"{s.Item.Ma}\",\"{s.Item.Ten}\",\"{s.Kho.TenKho}\",\"{batch}\",\"{expiry}\",{s.SoLuongTon},\"{s.Item.DonViTinhCoBan}\",{price},{value}");
            }
        }
        else
        {
            sb.AppendLine("BÁO CÁO NĂNG SUẤT BÁC SĨ VÀ PHÒNG KHÁM");
            sb.AppendLine($"Thời gian: Từ {from:dd/MM/yyyy} đến {to.AddDays(-1):dd/MM/yyyy}");
            sb.AppendLine();
            sb.AppendLine("Bác sĩ,Khoa,Số ca khám,Đã hoàn thành,Số đơn thuốc,Số chỉ định CLS");

            var docQuery = luotKhamRepo.GetQueryable().AsNoTracking()
                .Include(v => v.BacSi)
                .Include(v => v.Khoa)
                .Where(v => v.NgayKham >= from && v.NgayKham < to && v.MaBacSi.HasValue);

            if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
                docQuery = docQuery.Where(v => v.MaCoSo == request.FacilityId.Value);
            if (request.DepartmentId.HasValue && request.DepartmentId.Value > 0)
                docQuery = docQuery.Where(v => v.MaKhoa == request.DepartmentId.Value);

            var docStats = await docQuery
                .GroupBy(v => new { v.MaBacSi, v.BacSi!.HoTen, Department = v.Khoa.Ten })
                .Select(g => new
                {
                    DoctorName = g.Key.HoTen,
                    Department = g.Key.Department,
                    Total = g.Count(),
                    Completed = g.Count(x => x.TrangThai == TrangThaiLuotKham.HOAN_THANH),
                    Prescriptions = g.SelectMany(x => x.DonThuocs).Count(),
                    Cls = g.SelectMany(x => x.ChiDinhDichVus).Count()
                })
                .ToListAsync(cancellationToken);

            foreach (var d in docStats)
            {
                sb.AppendLine($"\"{d.DoctorName}\",\"{d.Department}\",{d.Total},{d.Completed},{d.Prescriptions},{d.Cls}");
            }
        }

        var preamble = Encoding.UTF8.GetPreamble();
        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        var fullBytes = preamble.Concat(bytes).ToArray();

        var fileName = $"BaoCao_{tab}_{DateTime.Now:yyyyMMdd_HHmm}.csv";

        return new ExportSystemReportDto
        {
            FileContents = fullBytes,
            ContentType = "text/csv; charset=utf-8",
            FileName = fileName
        };
    }
}
