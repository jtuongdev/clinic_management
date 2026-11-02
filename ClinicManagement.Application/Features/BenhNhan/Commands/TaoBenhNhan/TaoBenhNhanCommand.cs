using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Common.Enums;
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.BenhNhan.Commands
{
    public class TaoBenhNhanCommand : IRequest<BenhNhanDto>
    {
        public string Ho { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public DateTime NgaySinh { get; set; }
        public GioiTinh GioiTinh { get; set; }
        public string DienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SoCCCD { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string NguoiLienHeTen { get; set; } = string.Empty;
        public string NguoiLienHeDienThoai { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public int MaKhoa { get; set; }
        public int? MaPhongKham { get; set; } 
        public int? MaBacSi { get; set; }
        public BaoHiemRequest? BaoHiem { get; set; }
        public List<TienSuBenhRequest> TienSuBenhs { get; set; } = new List<TienSuBenhRequest>();
        public int CreatedBy { get; set; }
    }
}