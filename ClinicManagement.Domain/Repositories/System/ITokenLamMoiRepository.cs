using ClinicManagement.Domain.System;

namespace ClinicManagement.Domain.Repositories.System
{
    public interface ITokenLamMoiRepository
    {
        Task AddAsync(TokenLamMoi token, CancellationToken cancellationToken = default);
        Task<TokenLamMoi?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
        Task RevokeByTokenAsync(string token, CancellationToken cancellationToken = default);
        Task RevokeAllByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
