using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.Kho.Queries.DanhSachNhaCungCap;

public sealed class DanhSachNhaCungCapQueryHandler(IKhoRepository db)
    : IRequestHandler<DanhSachNhaCungCapQuery, InventoryResult>
{
    public async Task<InventoryResult> Handle(DanhSachNhaCungCapQuery r, CancellationToken ct)
    {
        var pageIndex = Math.Max(1, r.PageIndex);
        var pageSize = Math.Clamp(r.PageSize, 1, 100);
        var keyword = r.Keyword?.Trim();

        var q = db.NhaCungCaps
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        if (!string.IsNullOrWhiteSpace(keyword))
            q = q.Where(x => x.Ma.Contains(keyword) || x.Ten.Contains(keyword));

        if (r.Status.HasValue)
            q = q.Where(x => x.TrangThai == r.Status.Value);

        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(x => x.Id)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new NhaCungCapDto(x.Id, x.Ma, x.Ten, x.DiaChi, x.DienThoai, x.Email, x.MaSoThue, x.TrangThai))
            .ToListAsync(ct);

        return InventoryResult.Ok(new { items, total, pageIndex, pageSize });
    }
}
