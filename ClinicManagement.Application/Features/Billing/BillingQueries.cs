using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Billing;

public sealed record GetInvoiceByIdQuery(int InvoiceId) : IRequest<HoaDonDetailDto?>;
public sealed record GetInvoiceByVisitQuery(int VisitId) : IRequest<HoaDonDetailDto?>;
public sealed record GetInvoicePaymentsQuery(int InvoiceId) : IRequest<IReadOnlyList<PhieuThuDto>>;
public sealed record GetPatientDebtsQuery(int PatientId) : IRequest<IReadOnlyList<CongNoDto>>;
public sealed record GetOverdueDebtsQuery(int FacilityId) : IRequest<IReadOnlyList<CongNoDto>>;
public sealed record GetInvoicesQuery(
    int FacilityId,
    DateTime? FromDate,
    DateTime? ToDate,
    TrangThaiHoaDon? Status,
    int PageIndex = 1,
    int PageSize = 20) : IRequest<PagedResult<HoaDonListDto>>;

public sealed class GetInvoiceByIdHandler(IHoaDonRepository repository)
    : IRequestHandler<GetInvoiceByIdQuery, HoaDonDetailDto?>
{
    public async Task<HoaDonDetailDto?> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
        => (await repository.GetByIdAsync(request.InvoiceId, cancellationToken)) is { } invoice
            ? BillingMapper.ToDetail(invoice)
            : null;
}

public sealed class GetInvoiceByVisitHandler(IHoaDonRepository repository)
    : IRequestHandler<GetInvoiceByVisitQuery, HoaDonDetailDto?>
{
    public async Task<HoaDonDetailDto?> Handle(GetInvoiceByVisitQuery request, CancellationToken cancellationToken)
        => (await repository.GetByLuotKhamAsync(request.VisitId, cancellationToken)) is { } invoice
            ? BillingMapper.ToDetail(invoice)
            : null;
}

public sealed class GetInvoicePaymentsHandler(IHoaDonRepository repository)
    : IRequestHandler<GetInvoicePaymentsQuery, IReadOnlyList<PhieuThuDto>>
{
    public async Task<IReadOnlyList<PhieuThuDto>> Handle(
        GetInvoicePaymentsQuery request, CancellationToken cancellationToken)
        => (await repository.GetByIdAsync(request.InvoiceId, cancellationToken))?.PhieuThus
            .Select(payment => new PhieuThuDto
            {
                Id = payment.Id,
                SoPhieuThu = payment.SoPhieuThu,
                SoTien = payment.SoTien,
                NgayThu = payment.NgayThu,
                PhuongThuc = payment.PhuongThuc.ToString(),
                NguoiThu = payment.NguoiThu?.HoTen ?? string.Empty,
                GhiChu = payment.GhiChu
            }).ToList() ?? [];
}

public sealed class GetPatientDebtsHandler(IHoaDonRepository repository)
    : IRequestHandler<GetPatientDebtsQuery, IReadOnlyList<CongNoDto>>
{
    public async Task<IReadOnlyList<CongNoDto>> Handle(
        GetPatientDebtsQuery request, CancellationToken cancellationToken)
        => (await repository.GetCongNoByBenhNhanAsync(request.PatientId, cancellationToken))
            .Select(debt => new CongNoDto
            {
                Id = debt.Id,
                MaBenhNhan = debt.MaBenhNhan,
                MaHoaDon = debt.MaHoaDon,
                SoTienNo = debt.SoTienNo,
                SoTienDaTra = debt.SoTienDaTra,
                SoTienConLai = debt.SoTienConLai,
                TrangThai = debt.TrangThai.ToString(),
                HanThanhToan = debt.HanThanhToan
            }).ToList();
}

public sealed class GetOverdueDebtsHandler(IHoaDonRepository repository)
    : IRequestHandler<GetOverdueDebtsQuery, IReadOnlyList<CongNoDto>>
{
    public async Task<IReadOnlyList<CongNoDto>> Handle(
        GetOverdueDebtsQuery request, CancellationToken cancellationToken)
        => (await repository.GetCongNoQuaHanAsync(request.FacilityId, cancellationToken))
            .Select(debt => new CongNoDto
            {
                Id = debt.Id,
                MaBenhNhan = debt.MaBenhNhan,
                MaHoaDon = debt.MaHoaDon,
                SoTienNo = debt.SoTienNo,
                SoTienDaTra = debt.SoTienDaTra,
                SoTienConLai = debt.SoTienConLai,
                TrangThai = debt.TrangThai.ToString(),
                HanThanhToan = debt.HanThanhToan
            }).ToList();
}

public sealed class GetInvoicesHandler(IHoaDonRepository repository)
    : IRequestHandler<GetInvoicesQuery, PagedResult<HoaDonListDto>>
{
    public async Task<PagedResult<HoaDonListDto>> Handle(
        GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        var pageIndex = Math.Max(request.PageIndex, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var (items, total) = await repository.GetByCoSoAsync(
            request.FacilityId, request.FromDate, request.ToDate, request.Status,
            pageIndex, pageSize, cancellationToken);
        return new PagedResult<HoaDonListDto>
        {
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalCount = total,
            Items = items.Select(BillingMapper.ToListItem).ToList()
        };
    }
}
