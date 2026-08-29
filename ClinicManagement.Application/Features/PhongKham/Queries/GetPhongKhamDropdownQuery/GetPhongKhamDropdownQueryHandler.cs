using MediatR;
using ClinicManagement.Application.DTOs.PhongKham;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.PhongKham.Queries
{
    public class GetPhongKhamDropdownQueryHandler
        : IRequestHandler<GetPhongKhamDropdownQuery, IEnumerable<PhongKhamDropdownDto>>
    {
        private readonly IPhongKhamRepository _phongKhamRepo;

        public GetPhongKhamDropdownQueryHandler(IPhongKhamRepository phongKhamRepo)
        {
            _phongKhamRepo = phongKhamRepo;
        }
        
        public async Task<IEnumerable<PhongKhamDropdownDto>> Handle(
            GetPhongKhamDropdownQuery request,
            CancellationToken cancellationToken)
        {
            var phongKhams = await _phongKhamRepo.GetByKhoaAsync(request.MaKhoa);

            return phongKhams.Select(p => new PhongKhamDropdownDto
            {
                Id = p.Id,
                Ten = p.Ten,
                Ma = p.Ma
            }).ToList();
        }
    }
}