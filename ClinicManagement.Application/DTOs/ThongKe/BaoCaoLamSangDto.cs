using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.ThongKe;

/// <summary>
/// DTO chứa toàn bộ dữ liệu Báo cáo & Thống kê Lâm sàng (route /examination/reports).
/// </summary>
public class BaoCaoLamSangDto
{
    /// <summary>
    /// 6 thẻ chỉ số KPI điều hành chính
    /// </summary>
    public ClinicalKpisDto Kpis { get; set; } = new();

    /// <summary>
    /// Biểu đồ doanh thu phân bổ theo Khoa / Phòng
    /// </summary>
    public List<RevenueByDepartmentDto> RevenueByDepartment { get; set; } = new();

    /// <summary>
    /// Bảng xếp hạng bác sĩ có hiệu suất khám cao
    /// </summary>
    public List<DoctorKpiDto> DoctorKpis { get; set; } = new();
}

/// <summary>
/// 6 thẻ KPI chỉ số điều hành lâm sàng
/// </summary>
public class ClinicalKpisDto
{
    /// <summary>
    /// 1. Doanh thu trong kỳ báo cáo (VNĐ)
    /// </summary>
    public decimal Revenue { get; set; }

    /// <summary>
    /// 2. Tổng số lượt khám hoàn thành
    /// </summary>
    public int CompletedVisits { get; set; }

    /// <summary>
    /// 3. Tỷ lệ hưởng / chi trả BHYT (%)
    /// </summary>
    public decimal? BhytReimbursementRate { get; set; }

    /// <summary>
    /// 4. Chỉ số hài lòng người bệnh (%)
    /// </summary>
    public decimal? PatientSatisfactionRate { get; set; }

    /// <summary>
    /// Alias cho PatientSatisfactionRate
    /// </summary>
    public decimal? SatisfactionRate => PatientSatisfactionRate;

    /// <summary>
    /// 5. Số bác sĩ đang hoạt động
    /// </summary>
    public int ActiveDoctors { get; set; }

    /// <summary>
    /// 6. Số chuyên khoa đang mở tại cơ sở
    /// </summary>
    public int OpenDepartments { get; set; }
}

/// <summary>
/// Dữ liệu doanh thu theo từng Khoa / Phòng
/// </summary>
public class RevenueByDepartmentDto
{
    /// <summary>
    /// Tên Khoa / Phòng
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Tổng doanh thu (VNĐ)
    /// </summary>
    public decimal Value { get; set; }

    /// <summary>
    /// Tỷ lệ phần trăm trên tổng doanh thu (%)
    /// </summary>
    public decimal Percentage { get; set; }
}

/// <summary>
/// Dữ liệu KPI bác sĩ trong bảng xếp hạng hiệu suất
/// </summary>
public class DoctorKpiDto
{
    /// <summary>
    /// Thứ hạng (1, 2, 3...)
    /// </summary>
    public int Rank { get; set; }

    /// <summary>
    /// Mã bác sĩ
    /// </summary>
    public int DoctorId { get; set; }

    /// <summary>
    /// Họ và tên bác sĩ
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Tên chuyên khoa / Khoa phòng phụ trách
    /// </summary>
    public string Department { get; set; } = string.Empty;

    /// <summary>
    /// Số ca khám hoàn thành
    /// </summary>
    public int Count { get; set; }

    /// <summary>
    /// Đánh giá / Hài lòng (ví dụ: "5.0/5", "4.9/5", "98%")
    /// </summary>
    public string Rating { get; set; } = string.Empty;

    /// <summary>
    /// Doanh thu từ các ca khám do bác sĩ thực hiện (VNĐ)
    /// </summary>
    public decimal Revenue { get; set; }
}

/// <summary>
/// DTO kết quả xuất file báo cáo (CSV/Excel)
/// </summary>
public class ExportClinicalReportDto
{
    public byte[] FileContent { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "text/csv; charset=utf-8";
    public string FileName { get; set; } = string.Empty;
}
