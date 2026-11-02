
using MediatR;
using ClinicManagement.Application.DTOs.PhongKham;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.PhongKham.Queries
{
    public class LayPhongKhamTheoKhoaQueryHandler
        : IRequestHandler<LayPhongKhamTheoKhoaQuery, IEnumerable<PhongKhamDto>>
    {
        private readonly IPhongKhamRepository _phongKhamRepo;

        public LayPhongKhamTheoKhoaQueryHandler(IPhongKhamRepository phongKhamRepo)
        {
            _phongKhamRepo = phongKhamRepo;
        }

        public async Task<IEnumerable<PhongKhamDto>> Handle(
            LayPhongKhamTheoKhoaQuery request,
            CancellationToken cancellationToken)
        {
            var phongKhams = await _phongKhamRepo.GetByKhoaAsync(request.MaKhoa);

            return phongKhams.Select(p => new PhongKhamDto
            {
                Id = p.Id,
                Ma = p.Ma,
                Ten = p.Ten,
                MaKhoa = p.MaKhoa,
                TenKhoa = p.Khoa?.Ten ?? string.Empty,
                TrangThai = p.TrangThai
            });
        }
    }
}