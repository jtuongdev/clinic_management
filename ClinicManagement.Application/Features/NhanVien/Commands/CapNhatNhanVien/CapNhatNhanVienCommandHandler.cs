using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public class CapNhatNhanVienCommandHandler : IRequestHandler<CapNhatNhanVienCommand, NhanVienDetailDto>
    {
        private readonly INhanVienRepository repository;

        public CapNhatNhanVienCommandHandler(INhanVienRepository repository)
        {
            this.repository = repository;
        }

        public async Task<NhanVienDetailDto> Handle(CapNhatNhanVienCommand command, CancellationToken cancellationToken)
        {
            var employee = await repository.GetDetailForUpdateAsync(command.Id, cancellationToken)
                ?? await repository.GetByIdAsync(command.Id)
                ?? throw new KeyNotFoundException("Không tìm thấy nhân viên.");
            var request = command.Request;
            var email = request.Email.Trim();
            var licenseNumber = request.SoHanhNghe.Trim();

            if (!string.IsNullOrWhiteSpace(email) && await repository.IsEmailExistAsync(email, command.Id))
                throw new InvalidOperationException("Email đã được sử dụng.");
            if (!string.IsNullOrWhiteSpace(licenseNumber) && await repository.IsSoHanhNgheExistAsync(licenseNumber, command.Id))
                throw new InvalidOperationException("Số hành nghề đã được sử dụng.");

            employee.UpdateProfile(request.HoTen.Trim(), request.NgaySinh, request.GioiTinh, email, request.DienThoai.Trim());
            employee.UpdateEmployment(request.MaChucVu, request.ChuyenKhoa.Trim(), licenseNumber);

            if (request.MaKhoa.HasValue && request.MaKhoa.Value > 0)
            {
                var mainDept = employee.NhanVienKhoa?.FirstOrDefault(k => k.LaKhoaChinh)
                               ?? employee.NhanVienKhoa?.FirstOrDefault();
                if (mainDept != null)
                {
                    if (mainDept.MaKhoa != request.MaKhoa.Value)
                    {
                        mainDept.MaKhoa = request.MaKhoa.Value;
                        mainDept.TuNgay = DateTime.UtcNow.Date;
                        mainDept.LaKhoaChinh = true;
                    }
                }
                else
                {
                    employee.NhanVienKhoa?.Add(new ClinicManagement.Domain.Identity.NhanVienKhoa
                    {
                        MaNhanVien = employee.Id,
                        MaKhoa = request.MaKhoa.Value,
                        TuNgay = DateTime.UtcNow.Date,
                        LaKhoaChinh = true
                    });
                }
            }

            if (request.LuongCoBan.HasValue && request.LuongCoBan.Value >= 0)
            {
                employee.SetSalary(request.LuongCoBan.Value);
            }

            repository.Update(employee);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

            var result = await repository.GetDetailByIdAsync(command.Id, cancellationToken);
            return AnhXaNhanVien.ToDetail(result ?? employee);
        }
    }
}
