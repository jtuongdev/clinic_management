using MediatR;
using ClinicManagement.Application.Common.Models;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.Auth.Commands;

public class DoiMatKhauCommandHandler : IRequestHandler<DoiMatKhauCommand, Result<bool>>
{
    private readonly INhanVienRepository _nhanVienRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenLamMoiRepository _tokenLamMoiRepository;

    public DoiMatKhauCommandHandler(
        INhanVienRepository nhanVienRepository, 
        IPasswordHasher passwordHasher,
        ITokenLamMoiRepository tokenLamMoiRepository)
    {
        _nhanVienRepository = nhanVienRepository;
        _passwordHasher = passwordHasher;
        _tokenLamMoiRepository = tokenLamMoiRepository;
    }

    public async Task<Result<bool>> Handle(DoiMatKhauCommand request, CancellationToken cancellationToken)
    {
        var nhanVien = await _nhanVienRepository.GetByIdAsync(request.UserId);
        if (nhanVien == null)
        {
            return Result<bool>.Fail("Người dùng không tồn tại.");
        }

        bool isPasswordValid = _passwordHasher.VerifyPassword(request.OldPassword, nhanVien.PasswordHash);
        bool isLegacyPlainTextPassword = !isPasswordValid && string.Equals(request.OldPassword, nhanVien.PasswordHash, StringComparison.Ordinal);

        if (!isPasswordValid && !isLegacyPlainTextPassword)
        {
            return Result<bool>.Fail("Mật khẩu cũ không chính xác.");
        }

        var hashedNewPassword = _passwordHasher.HashPassword(request.NewPassword);
        nhanVien.SetPassword(hashedNewPassword);

        _nhanVienRepository.Update(nhanVien);
        await _nhanVienRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

        // Thu hồi toàn bộ refresh token cũ của tài khoản sau khi đổi mật khẩu thành công
        await _tokenLamMoiRepository.RevokeAllByUserAsync(request.UserId, cancellationToken);

        return Result<bool>.Ok(true, "Đổi mật khẩu thành công. Các phiên đăng nhập cũ đã được thu hồi.");
    }
}
