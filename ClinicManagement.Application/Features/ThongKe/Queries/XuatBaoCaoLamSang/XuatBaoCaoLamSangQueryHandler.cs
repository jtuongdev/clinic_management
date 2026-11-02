using System;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.ThongKe;
using ClinicManagement.Application.Features.ThongKe.Queries.LayBaoCaoLamSang;
using MediatR;

namespace ClinicManagement.Application.Features.ThongKe.Queries.XuatBaoCaoLamSang;

public class XuatBaoCaoLamSangQueryHandler : IRequestHandler<XuatBaoCaoLamSangQuery, ExportClinicalReportDto>
{
    private readonly IMediator _mediator;

    public XuatBaoCaoLamSangQueryHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task<ExportClinicalReportDto> Handle(XuatBaoCaoLamSangQuery request, CancellationToken cancellationToken)
    {
        // 1. Lấy dữ liệu báo cáo từ Query xử lý
        var reportData = await _mediator.Send(new LayBaoCaoLamSangQuery
        {
            FacilityId = request.FacilityId,
            DepartmentId = request.DepartmentId,
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            Shift = request.Shift
        }, cancellationToken);

        var viCulture = CultureInfo.GetCultureInfo("vi-VN");
        var now = DateTime.UtcNow;
        var from = (request.FromDate ?? new DateTime(now.Year, now.Month, 1)).Date;
        var to = (request.ToDate ?? now).Date;

        var sb = new StringBuilder();

        // Header thông tin báo cáo
        sb.AppendLine("HỆ THỐNG QUẢN LÝ PHÒNG KHÁM - CLINIC MANAGEMENT");
        sb.AppendLine("BÁO CÁO & THỐNG KÊ LÂM SÀNG ĐIỀU HÀNH");
        sb.AppendLine($"Kỳ báo cáo: Từ ngày {from:dd/MM/yyyy} đến ngày {to:dd/MM/yyyy}");
        sb.AppendLine($"Thời điểm xuất báo cáo: {DateTime.Now:dd/MM/yyyy HH:mm:ss}");
        if (request.FacilityId.HasValue && request.FacilityId.Value > 0)
        {
            sb.AppendLine($"Phạm vi: Cơ sở #{request.FacilityId.Value}");
        }
        sb.AppendLine();

        // PHẦN 1: CÁC CHỈ SỐ KPI ĐIỀU HÀNH
        sb.AppendLine("--- I. CHỈ SỐ KPI ĐIỀU HÀNH CHÍNH ---");
        sb.AppendLine("Chỉ số KPI,Giá trị,Đơn vị");
        sb.AppendLine($"\"Doanh thu trong kỳ\",\"{reportData.Kpis.Revenue.ToString("N0", viCulture)}\",\"VNĐ\"");
        sb.AppendLine($"\"Lượt khám hoàn thành\",\"{reportData.Kpis.CompletedVisits.ToString("N0", viCulture)}\",\"Lượt\"");
        sb.AppendLine($"\"Tỷ lệ hưởng BHYT\",\"{ (reportData.Kpis.BhytReimbursementRate.HasValue ? reportData.Kpis.BhytReimbursementRate.Value.ToString("F1") + "%" : "--") }\",\"");
        sb.AppendLine($"\"Chỉ số hài lòng\",\"{ (reportData.Kpis.PatientSatisfactionRate.HasValue ? reportData.Kpis.PatientSatisfactionRate.Value.ToString("F1") + "%" : "--") }\",\"");
        sb.AppendLine($"\"Bác sĩ đang hoạt động\",\"{reportData.Kpis.ActiveDoctors}\",\"Bác sĩ\"");
        sb.AppendLine($"\"Chuyên khoa đang mở\",\"{reportData.Kpis.OpenDepartments}\",\"Khoa\"");
        sb.AppendLine();

        // PHẦN 2: DOANH THU THEO KHOA / PHÒNG
        sb.AppendLine("--- II. DOANH THU THEO KHOA / PHÒNG ---");
        sb.AppendLine("STT,Khoa / Phòng,Doanh thu (VNĐ),Tỷ trọng (%)");
        int deptIndex = 1;
        foreach (var item in reportData.RevenueByDepartment)
        {
            sb.AppendLine($"{deptIndex++},{EscapeCsv(item.Name)},\"{item.Value.ToString("N0", viCulture)}\",{item.Percentage:F1}%");
        }
        sb.AppendLine($"Tổng cộng,Tất cả khoa,\"{reportData.Kpis.Revenue.ToString("N0", viCulture)}\",100.0%");
        sb.AppendLine();

        // PHẦN 3: BẢNG XẾP HẠNG HIỆU SUẤT BÁC SĨ
        sb.AppendLine("--- III. BẢNG XẾP HẠNG HIỆU SUẤT BÁC SĨ ---");
        sb.AppendLine("Hạng,Mã BS,Họ và tên Bác sĩ,Khoa phòng / Chuyên khoa,Số ca khám hoàn thành,Đánh giá hài lòng,Doanh thu (VNĐ)");
        foreach (var doc in reportData.DoctorKpis)
        {
            sb.AppendLine($"{doc.Rank},{doc.DoctorId},{EscapeCsv(doc.Name)},{EscapeCsv(doc.Department)},{doc.Count},{EscapeCsv(doc.Rating)},\"{doc.Revenue.ToString("N0", viCulture)}\"");
        }

        // Tạo file byte array với UTF-8 BOM để Excel hiển thị tiếng Việt chuẩn
        var preamble = Encoding.UTF8.GetPreamble();
        var contentBytes = Encoding.UTF8.GetBytes(sb.ToString());
        var fullBytes = new byte[preamble.Length + contentBytes.Length];
        Buffer.BlockCopy(preamble, 0, fullBytes, 0, preamble.Length);
        Buffer.BlockCopy(contentBytes, 0, fullBytes, preamble.Length, contentBytes.Length);

        var fileName = $"BaoCao_LamSang_{from:yyyyMMdd}_{to:yyyyMMdd}_{DateTime.Now:HHmmss}.csv";

        return new ExportClinicalReportDto
        {
            FileContent = fullBytes,
            ContentType = "text/csv; charset=utf-8",
            FileName = fileName
        };
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "\"\"";
        return $"\"{value.Replace("\"", "\"\"")}\"";
    }
}
