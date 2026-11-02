using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Infrastructure.Persistence;
using ClinicManagement.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Infrastructure.Persistence.Repositories;

public class KhoaRepository : Repository<Khoa>, IKhoaRepository
{
    public KhoaRepository(ClinicDbContext context)
        : base(context)
    {
    }

    public async Task<IEnumerable<Khoa>> GetKhoasByCoSoAsync(int? maCoSo = null)
    {
        var query = _context.Khoas
            .AsNoTracking()
            .Where(k => !k.IsDeleted);

        if (maCoSo.HasValue && maCoSo.Value > 0)
        {
            query = query.Where(k => k.MaCoSo == maCoSo.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<IReadOnlyList<Khoa>> GetKhoasWithDetailsAsync(
            int? maCoSo = null,
            CancellationToken cancellationToken = default)
    {
        var query = _context.Khoas
            .AsNoTracking()
            .Include(k => k.NhanVienKhoa)
                .ThenInclude(nk => nk.NhanVien)
            .Include(k => k.LuotKhams)  
            .Where(k => !k.IsDeleted);

        if (maCoSo.HasValue)
            query = query.Where(k => k.MaCoSo == maCoSo.Value);

        return await query.ToListAsync(cancellationToken);
    }
}