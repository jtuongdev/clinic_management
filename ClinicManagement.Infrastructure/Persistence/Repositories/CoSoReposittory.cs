using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ClinicManagement.Infrastructure.Persistence.Repositories;

public partial class CoSoRepository : Repository<CoSo>, ICoSoRepository
{
    public CoSoRepository(ClinicDbContext context) : base(context)
    {
    }

}
