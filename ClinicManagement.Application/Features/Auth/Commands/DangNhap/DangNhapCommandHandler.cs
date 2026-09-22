using MediatR;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Auth;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Application.Features.Auth.Commands
{
    public class DangNhapCommandHandler : IRequestHandler<DangNhapCommand, LoginResponse>
    {
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenLamMoiRepository _tokenLamMoiRepo;

        public DangNhapCommandHandler(
            INhanVienRepository nhanVienRepo, 
            IJwtService jwtService,
            IPasswordHasher passwordHasher,
            ITokenLamMoiRepository tokenLamMoiRepo)
        {
            _nhanVienRepo = nhanVienRepo;
            _jwtService = jwtService;
            _passwordHasher = passwordHasher;
            _tokenLamMoiRepo = tokenLamMoiRepo;
        }

        public async Task<LoginResponse> Handle(DangNhapCommand request, CancellationToken cancellationToken)
        {
            var user = await _nhanVienRepo.GetByUsernameAsync(request.Username);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng");
            }
            bool isPasswordValid = _passwordHasher.VerifyPassword(
                request.Password, user.PasswordHash
            );
            bool isLegacyPlainTextPassword = !isPasswordValid &&
                string.Equals(request.Password, user.PasswordHash, StringComparison.Ordinal);
            if (!isPasswordValid)
            {
                if (!isLegacyPlainTextPassword)
                {
                    throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng");
                }

                user.SetPassword(_passwordHasher.HashPassword(request.Password));
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Tài khoản đã bị khóa");
            }
            var userRoles = await _nhanVienRepo.GetRolesByUserIdAsync(user.Id);
            var roles = userRoles.Where(r => r.TenVaiTro != null).Select(r => r.TenVaiTro!).ToList();

            var accessToken = _jwtService.GenerateAccessToken(user, roles);
            var refreshToken = _jwtService.GenerateRefreshToken();
            user.RecordLogin();

            await _tokenLamMoiRepo.AddAsync(new TokenLamMoi
            {
                MaNhanVien = user.Id,
                MaToken = refreshToken,
                NgayHetHan = DateTime.UtcNow.AddDays(7),
                DaHuyBo = false
            }, cancellationToken);

            await _nhanVienRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
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
