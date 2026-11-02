using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class AdminDoiMatKhauBenhNhanCommandHandler : IRequestHandler<AdminDoiMatKhauBenhNhanCommand, bool>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenLamMoiRepository _tokenLamMoiRepo;

        public AdminDoiMatKhauBenhNhanCommandHandler(
            IBenhNhanRepository benhNhanRepo,
            IPasswordHasher passwordHasher,
            ITokenLamMoiRepository tokenLamMoiRepo)
        {
            _benhNhanRepo = benhNhanRepo;
            _passwordHasher = passwordHasher;
            _tokenLamMoiRepo = tokenLamMoiRepo;
        }

        public async Task<bool> Handle(AdminDoiMatKhauBenhNhanCommand request, CancellationToken cancellationToken)
        {
            if (request.PatientId <= 0)
            {
                throw new ArgumentException("Mã bệnh nhân không hợp lệ.");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                throw new ArgumentException("Mật khẩu mới phải từ 6 ký tự trở lên.");
            }

            var benhNhan = await _benhNhanRepo.GetByIdAsync(request.PatientId);
            if (benhNhan == null || benhNhan.IsDeleted)
            {
                throw new KeyNotFoundException($"Không tìm thấy hồ sơ bệnh nhân #{request.PatientId}.");
            }

            var hashedPassword = _passwordHasher.HashPassword(request.NewPassword);
            benhNhan.ChangePassword(hashedPassword);

            _benhNhanRepo.Update(benhNhan);
            await _benhNhanRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            // Thu hồi toàn bộ refresh token cũ của bệnh nhân
            await _tokenLamMoiRepo.RevokeAllByPatientAsync(benhNhan.Id, cancellationToken);

            return true;
        }
    }
}
