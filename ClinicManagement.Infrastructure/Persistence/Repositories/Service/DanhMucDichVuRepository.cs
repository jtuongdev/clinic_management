using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Service;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class DanhMucDichVuRepository : Repository<DanhMucDichVu>, IDanhMucDichVuRepository
    {
        public DanhMucDichVuRepository(ClinicDbContext context) : base(context)
        {
        }
    }
}
