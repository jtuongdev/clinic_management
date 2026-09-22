using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayThongKeBenhNhanQuery : IRequest<ThongKeBenhNhanDto>
    {
        public int? MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
    }
}