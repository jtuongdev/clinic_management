using ClinicManagement.Domain.Facility;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClinicManagement.Domain.Repositories;

public partial interface IKhoaRepository : IRepository<Khoa>
{
    Task<IEnumerable<Khoa>> GetKhoasByCoSoAsync(int? maCoSo = null);
    Task<IReadOnlyList<Khoa>> GetKhoasWithDetailsAsync(
            int? maCoSo = null,
            CancellationToken cancellationToken = default);
}