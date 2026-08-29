using MediatR;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.Auth;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.Auth.Commands
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
    {
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly IJwtService _jwtService;
        private readonly IPasswordHasher _passwordHasher;

        public LoginCommandHandler(
            INhanVienRepository nhanVienRepo, 
            IJwtService jwtService,
            IPasswordHasher passwordHasher)
        {
            _nhanVienRepo = nhanVienRepo;
            _jwtService = jwtService;
            _passwordHasher = passwordHasher;
        }

        public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _nhanVienRepo.GetByUsernameAsync(request.Username);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng");
            }
            bool isPasswordValid = _passwordHasher.VerifyPassword(
                request.Password, user.PasswordHash ?? string.Empty
            ) || request.Password == user.PasswordHash;
            if (!isPasswordValid)
            {
                throw new UnauthorizedAccessException("Tên đăng nhập hoặc mật khẩu không đúng");
            }
            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Tài khoản đã bị khóa");
            }
            var userRoles = await _nhanVienRepo.GetRolesByUserIdAsync(user.Id);
            var roles = userRoles.Where(r => r.TenVaiTro != null).Select(r => r.TenVaiTro!).ToList();

            var accessToken = _jwtService.GenerateAccessToken(user, roles);
            var refreshToken = _jwtService.GenerateRefreshToken();
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
