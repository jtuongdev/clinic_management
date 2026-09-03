using ClinicManagement.Application.DTOs.NhanVien;
using FluentValidation;

namespace ClinicManagement.Application.Features.NhanVien.Commands
{
    public class CreateNhanVienCommandValidator : AbstractValidator<CreateNhanVienCommand>
    {
        public CreateNhanVienCommandValidator()
        {
            RuleFor(x => x.Request.Username).NotEmpty().Length(3, 50);
            RuleFor(x => x.Request.Password).NotEmpty().MinimumLength(8);
            RuleFor(x => x.Request.HoTen).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Request.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Request.Email));
            RuleFor(x => x.Request.DienThoai).MaximumLength(20);
            RuleFor(x => x.Request.ChuyenKhoa).MaximumLength(100);
            RuleFor(x => x.Request.SoHanhNghe).MaximumLength(50);
            RuleFor(x => x.Request.NgaySinh).LessThan(DateTime.UtcNow.Date).When(x => x.Request.NgaySinh.HasValue);
        }
    }
}