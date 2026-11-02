using MediatR;
using ClinicManagement.Application.DTOs.PhongKham;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.PhongKham.Queries
{
    public class LayPhongKhamTheoKhoaQuery : IRequest<IEnumerable<PhongKhamDto>>
    {
        public int MaKhoa { get; set; }
    }
}