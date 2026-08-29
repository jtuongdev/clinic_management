using MediatR;
using ClinicManagement.Application.DTOs.NhanVien;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class GetBacSiTrucQuery : IRequest<List<BacSiTrucDto>>
    {
        public int? MaCoSo { get; set; }
        public int? MaKhoa { get; set; } 
    }
}