using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class GetNhanViensPagedQueryHandler : IRequestHandler<GetNhanViensPagedQuery, PagedResult<NhanVienListDto>>
    {
        private readonly INhanVienRepository repository;

        public GetNhanViensPagedQueryHandler(INhanVienRepository repository)
        {
            this.repository = repository;
        }

        public async Task<PagedResult<NhanVienListDto>> Handle(GetNhanViensPagedQuery request, CancellationToken cancellationToken)
        {
            var pageIndex = Math.Max(1, request.PageIndex);
            var pageSize = Math.Clamp(request.PageSize, 1, 100);
            var employees = await repository.GetPagedAsync(request.Keyword, request.MaChucVu, request.IsActive, pageIndex, pageSize, cancellationToken);
            var totalCount = await repository.CountPagedAsync(request.Keyword, request.MaChucVu, request.IsActive, cancellationToken);

            return new PagedResult<NhanVienListDto>
            {
                PageIndex = pageIndex,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = employees.Select(NhanVienDtoMapper.ToListItem).ToList()
            };
        }
    }
}
