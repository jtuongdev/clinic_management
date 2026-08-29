
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Domain.Common.Enums; 
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public partial class LuotKhamRepository 
    {

    public async Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetHangDoiByBacSiAsync(
        int maBacSi,
        int pageIndex,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        // Validate pageIndex và pageSize trước khi truy vấn
        if (pageIndex < 1) pageIndex = 1;
        if (pageSize < 1) pageSize = 1000;
        if (pageSize > 2000) pageSize = 2000;

        var query = _context.LuotKhams
            .AsNoTracking()
            .Include(l => l.BenhNhan)
                .ThenInclude(b => b.BenhNhanCoSo)
            .Include(l => l.Khoa)
            .Include(l => l.BacSi)
            .Where(l => !l.IsDeleted
                && l.MaBacSi == maBacSi
                && (l.TrangThai == TrangThaiLuotKham.CHO_KHAM || l.TrangThai == TrangThaiLuotKham.DANG_KHAM))
            .OrderBy(l => l.SoThuTu ?? int.MaxValue)
            .ThenBy(l => l.NgayKham);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
        
    }
}