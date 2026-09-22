using MediatR;
using ClinicManagement.Application.Common.Models;
using ClinicManagement.Domain.Repositories.System;

namespace ClinicManagement.Application.Features.Auth.Commands
{
    public class DangXuatCommandHandler : IRequestHandler<DangXuatCommand, Result<bool>>
    {
        private readonly ITokenLamMoiRepository _tokenLamMoiRepository;

        public DangXuatCommandHandler(ITokenLamMoiRepository tokenLamMoiRepository)
        {
            _tokenLamMoiRepository = tokenLamMoiRepository;
        }

        public async Task<Result<bool>> Handle(DangXuatCommand request, CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                await _tokenLamMoiRepository.RevokeByTokenAsync(request.RefreshToken.Trim(), cancellationToken);
            }
            else if (request.UserId > 0)
            {
                await _tokenLamMoiRepository.RevokeAllByUserAsync(request.UserId, cancellationToken);
            }

            return Result<bool>.Ok(true, "Đăng xuất thành công.");
        }
    }
}
