


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
        public async Task<IEnumerable<LuotKham>> GetDiagnosePatientInExamination(int id, CancellationToken cancellationToken = default)
        {
            var query = _context.LuotKhams
                .Include(lk => lk.ChanDoans)
                    .ThenInclude(cd => cd.ICD)
                .Where(lk => lk .Id == id && !lk.IsDeleted)
                .OrderByDescending(c => c.CreatedAt);
            return await query.ToListAsync(cancellationToken);
        }
    }
}
