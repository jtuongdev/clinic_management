using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;
using NhanVienEntity = ClinicManagement.Domain.Identity.NhanVien;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public class TaoNhanVienCommandHandler : IRequestHandler<TaoNhanVienCommand, NhanVienDetailDto>
    {
        private readonly INhanVienRepository repository;
        private readonly IPasswordHasher passwordHasher;

        public TaoNhanVienCommandHandler(INhanVienRepository repository, IPasswordHasher passwordHasher)
        {
            this.repository = repository;
            this.passwordHasher = passwordHasher;
        }

        public async Task<NhanVienDetailDto> Handle(TaoNhanVienCommand command, CancellationToken cancellationToken)
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

            if (request.MaKhoa.HasValue && request.MaKhoa.Value > 0)
            {
                employee.NhanVienKhoa.Add(new ClinicManagement.Domain.Identity.NhanVienKhoa
                {
                    MaKhoa = request.MaKhoa.Value,
                    TuNgay = DateTime.UtcNow.Date,
                    LaKhoaChinh = true
                });
            }

            if (request.LuongCoBan.HasValue && request.LuongCoBan.Value >= 0)
            {
                employee.SetSalary(request.LuongCoBan.Value);
            }

            await repository.AddAsync(employee);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            var result = await repository.GetDetailByIdAsync(employee.Id, cancellationToken);
            return AnhXaNhanVien.ToDetail(result ?? employee);
        }
    }
}
