namespace ClinicManagement.Domain.Repositories.System
{
    public interface IClinicalAccessRepository
    {
        Task<IReadOnlyList<string>> GetRoleNamesByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<int>> GetRoleIdsByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyDictionary<int, string>> GetRoleNamesByIdsAsync(IReadOnlyCollection<int> roleIds, CancellationToken cancellationToken = default);
        Task<Domain.Identity.VaiTro> CreateRoleAsync(string tenVaiTro, string? moTa, CancellationToken cancellationToken = default);
        Task<bool> DeleteRoleAsync(int roleId, CancellationToken cancellationToken = default);
        Task<bool> IsRoleAssignedToUsersAsync(int roleId, CancellationToken cancellationToken = default);
        Task<Domain.Identity.VaiTro?> GetRoleByIdAsync(int roleId, CancellationToken cancellationToken = default);
    }
}
