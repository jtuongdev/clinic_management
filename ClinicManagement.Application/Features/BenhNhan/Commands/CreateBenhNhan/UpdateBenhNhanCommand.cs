using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Common.Enums;
using System;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class UpdateBenhNhanCommand : IRequest<BenhNhanDto>
    {
        public int Id { get; set; }
        public string Ho { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public DateTime NgaySinh { get; set; }
        public GioiTinh GioiTinh { get; set; }
        public string DienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string NguoiLienHeTen { get; set; } = string.Empty;
        public string NguoiLienHeDienThoai { get; set; } = string.Empty;
        public int UpdatedBy { get; set; }
    }
}