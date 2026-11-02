using ClinicManagement.Domain.Repositories;
using MediatR;
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record HisSummaryBangLuongQuery(int BangLuongId) : IRequest<HisSummaryDto>;

public sealed class HisSummaryDto
{
    public int SoLuotKhamHoanThanh { get; set; }
    public decimal TienThuLaoKham { get; set; }
    public int SoDichVuClsChiDinh { get; set; }
    public decimal TongHoaHongCls { get; set; }
    public List<ChiTietLuotKhamDto> ChiTietLuotKhams { get; set; } = [];
}

public sealed class ChiTietLuotKhamDto
{
    public DateTime NgayKham { get; set; }
    public int MaBenhNhan { get; set; }
    public string TenBenhNhan { get; set; } = "";
    public string TrangThai { get; set; } = "";
}
