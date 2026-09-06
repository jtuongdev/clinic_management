using MediatR;
using ClinicManagement.Application.DTOs.NhanVien;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class GetBacSiByKhoaQuery : IRequest<List<BacSiDto>>
    {
        public int MaKhoa { get; set; }
        public int MaCoSo { get; set; } = 1;
    }
}