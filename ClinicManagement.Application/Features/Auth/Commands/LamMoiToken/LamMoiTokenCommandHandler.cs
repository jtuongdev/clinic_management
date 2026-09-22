using MediatR;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Auth;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Application.Features.Auth.Commands
{
    public class LamMoiTokenCommandHandler : IRequestHandler<LamMoiTokenCommand, LoginResponse>
    {
        private readonly ITokenLamMoiRepository _tokenLamMoiRepo;
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly IJwtService _jwtService;

        public LamMoiTokenCommandHandler(
            ITokenLamMoiRepository tokenLamMoiRepo,
            INhanVienRepository nhanVienRepo,
            IJwtService jwtService)
        {
            _tokenLamMoiRepo = tokenLamMoiRepo;
            _nhanVienRepo = nhanVienRepo;
            _jwtService = jwtService;
        }

        public async Task<LoginResponse> Handle(LamMoiTokenCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                throw new UnauthorizedAccessException("Refresh token không được để trống.");
            }

            var tokenEntity = await _tokenLamMoiRepo.GetByTokenAsync(request.RefreshToken.Trim(), cancellationToken);
            if (tokenEntity == null || tokenEntity.DaHuyBo || tokenEntity.DaHetHan() || !tokenEntity.MaNhanVien.HasValue)
            {
                throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn.");
            }

            var user = await _nhanVienRepo.GetByIdAsync(tokenEntity.MaNhanVien.Value);
            if (user == null || !user.IsActive || user.IsDeleted)
            {
                throw new UnauthorizedAccessException("Tài khoản không tồn tại hoặc đã bị khóa.");
            }

            // Revoke old token
            tokenEntity.HuyBo();

            // Fetch active roles
            var userRoles = await _nhanVienRepo.GetRolesByUserIdAsync(user.Id);
            var roles = userRoles.Where(r => r.TenVaiTro != null).Select(r => r.TenVaiTro!).ToList();

            // Generate new token pair (Token Rotation)
            var newAccessToken = _jwtService.GenerateAccessToken(user, roles);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            await _tokenLamMoiRepo.AddAsync(new TokenLamMoi
            {
                MaNhanVien = user.Id,
                MaToken = newRefreshToken,
                NgayHetHan = DateTime.UtcNow.AddDays(7),
                DaHuyBo = false
            }, cancellationToken);

            await _tokenLamMoiRepo.SaveChangesAsync(cancellationToken);

            return new LoginResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                User = new UserInfoDto
                {
                    Id = user.Id,
                    Username = user.Username ?? string.Empty,
                    FullName = user.HoTen ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    ChuyenKhoa = user.ChuyenKhoa ?? string.Empty,
                    Roles = roles
                }
            };
        }
    }
}
