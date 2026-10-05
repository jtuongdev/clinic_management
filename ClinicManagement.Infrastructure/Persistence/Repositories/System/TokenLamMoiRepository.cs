using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories.System
{
    public sealed class TokenLamMoiRepository(ClinicDbContext context) : ITokenLamMoiRepository
    {
        private readonly ClinicDbContext _context = context;

        public async Task AddAsync(TokenLamMoi token, CancellationToken cancellationToken = default)
        {
            await _context.TokenLamMois.AddAsync(token, cancellationToken);
        }

        public async Task<TokenLamMoi?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(token))
                return null;

            return await _context.TokenLamMois
                .Include(t => t.NhanVien)
                .Include(t => t.BenhNhan)
                .FirstOrDefaultAsync(t => t.MaToken == token, cancellationToken);
        }

        public async Task RevokeByTokenAsync(string token, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(token))
                return;

            var existing = await _context.TokenLamMois
                .FirstOrDefaultAsync(t => t.MaToken == token, cancellationToken);
            if (existing != null && !existing.DaHuyBo)
            {
                existing.HuyBo();
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task RevokeAllByUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            var tokens = await _context.TokenLamMois
                .Where(t => t.MaNhanVien == userId && !t.DaHuyBo)
                .ToListAsync(cancellationToken);

            foreach (var token in tokens)
            {
                token.HuyBo();
            }

            if (tokens.Count > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task RevokeAllByPatientAsync(int patientId, CancellationToken cancellationToken = default)
        {
            var tokens = await _context.TokenLamMois
                .Where(t => t.MaBenhNhan == patientId && !t.DaHuyBo)
                .ToListAsync(cancellationToken);

            foreach (var token in tokens)
            {
                token.HuyBo();
            }

            if (tokens.Count > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
