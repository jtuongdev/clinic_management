using System;
using ClinicManagement.Application.DTOs.ThongKe;
using MediatR;

namespace ClinicManagement.Application.Features.ThongKe.Queries.XuatBaoCaoLamSang;

/// <summary>
/// Query xuất file Báo cáo & Thống kê Lâm sàng (CSV/Excel)
/// </summary>
public class XuatBaoCaoLamSangQuery : IRequest<ExportClinicalReportDto>
{
    public int? FacilityId { get; set; }
    public int? DepartmentId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Shift { get; set; }
    public string Format { get; set; } = "csv";
}
