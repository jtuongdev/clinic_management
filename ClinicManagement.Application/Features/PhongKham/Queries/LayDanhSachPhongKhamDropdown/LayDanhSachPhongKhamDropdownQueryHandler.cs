using MediatR;
using ClinicManagement.Application.DTOs.PhongKham;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.PhongKham.Queries
{
    public class LayDanhSachPhongKhamDropdownQueryHandler
        : IRequestHandler<LayDanhSachPhongKhamDropdownQuery, IEnumerable<PhongKhamDropdownDto>>
    {
        private readonly IPhongKhamRepository _phongKhamRepo;

        public LayDanhSachPhongKhamDropdownQueryHandler(IPhongKhamRepository phongKhamRepo)
        {
            _phongKhamRepo = phongKhamRepo;
        }
        
        public async Task<IEnumerable<PhongKhamDropdownDto>> Handle(
            LayDanhSachPhongKhamDropdownQuery request,
            CancellationToken cancellationToken)
        {
            var phongKhams = request.MaKhoa.HasValue && request.MaKhoa.Value > 0
                ? await _phongKhamRepo.GetByKhoaAsync(request.MaKhoa.Value)
                : await _phongKhamRepo.GetActiveAsync();

            return phongKhams.Select(p => new PhongKhamDropdownDto
            {
                Id = p.Id,
                Ten = p.Ten,
                Ma = p.Ma,
                MaKhoa = p.MaKhoa
            }).ToList();
        }
    }
}