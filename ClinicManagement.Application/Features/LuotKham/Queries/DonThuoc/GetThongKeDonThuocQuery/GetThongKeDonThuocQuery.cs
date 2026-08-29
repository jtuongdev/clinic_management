using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.DTOs.Common;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetThongKeDonThuocQuery : IRequest<ThongKeDonThuocDto>
    {
        public int? MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
    }
}