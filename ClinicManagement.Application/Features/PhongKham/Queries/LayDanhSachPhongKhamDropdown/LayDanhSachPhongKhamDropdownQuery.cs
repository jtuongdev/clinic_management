using MediatR;
using ClinicManagement.Application.DTOs.PhongKham;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.PhongKham.Queries
{
    public class LayDanhSachPhongKhamDropdownQuery : IRequest<IEnumerable<PhongKhamDropdownDto>>
    {
        public int MaKhoa { get; set; }
    }
}