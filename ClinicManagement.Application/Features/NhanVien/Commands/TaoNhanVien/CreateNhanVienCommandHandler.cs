using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;
using NhanVienEntity = ClinicManagement.Domain.Identity.NhanVien;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public class CreateNhanVienCommandHandler : IRequestHandler<CreateNhanVienCommand, NhanVienDetailDto>
    {
        private readonly INhanVienRepository repository;
        private readonly IPasswordHasher passwordHasher;

        public CreateNhanVienCommandHandler(INhanVienRepository repository, IPasswordHasher passwordHasher)
        {
            this.repository = repository;
            this.passwordHasher = passwordHasher;
        }

        public async Task<NhanVienDetailDto> Handle(CreateNhanVienCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            var username = request.Username.Trim();
            var email = request.Email.Trim();
            var licenseNumber = request.SoHanhNghe.Trim();

            if (await repository.IsUsernameExistAsync(username))
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");
            if (!string.IsNullOrWhiteSpace(email) && await repository.IsEmailExistAsync(email))
                throw new InvalidOperationException("Email đã được sử dụng.");
            if (!string.IsNullOrWhiteSpace(licenseNumber) && await repository.IsSoHanhNgheExistAsync(licenseNumber))
                throw new InvalidOperationException("Số hành nghề đã được sử dụng.");

            var employee = new NhanVienEntity(
                username,
                passwordHasher.HashPassword(request.Password),
                request.HoTen.Trim(),
                request.NgaySinh,
                request.GioiTinh,
                email,
                request.DienThoai.Trim(),
                request.MaChucVu,
                request.ChuyenKhoa.Trim(),
                licenseNumber);

            await repository.AddAsync(employee);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            var result = await repository.GetDetailByIdAsync(employee.Id, cancellationToken);
            return NhanVienDtoMapper.ToDetail(result ?? employee);
        }
    }
}
