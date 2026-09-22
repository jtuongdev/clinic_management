namespace ClinicManagement.Domain.Repositories.System
{
    public interface IClinicalAccessRepository
    {
        Task<IReadOnlyList<string>> GetRoleNamesByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<int>> GetRoleIdsByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyDictionary<int, string>> GetRoleNamesByIdsAsync(IReadOnlyCollection<int> roleIds, CancellationToken cancellationToken = default);
    }
}
