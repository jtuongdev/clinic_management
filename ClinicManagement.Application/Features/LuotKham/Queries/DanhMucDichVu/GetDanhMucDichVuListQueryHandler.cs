using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.LuotKham.Queries.DanhMucDichVu
{
    public class GetDanhMucDichVuListQueryHandler : IRequestHandler<GetDanhMucDichVuListQuery, List<DanhMucDichVuDto>>
    {
        private readonly IDanhMucDichVuRepository _danhMucDichVuRepository;

        public GetDanhMucDichVuListQueryHandler(IDanhMucDichVuRepository danhMucDichVuRepository)
        {
            _danhMucDichVuRepository = danhMucDichVuRepository;
        }

        public async Task<List<DanhMucDichVuDto>> Handle(GetDanhMucDichVuListQuery request, CancellationToken cancellationToken)
        {
            var query = _danhMucDichVuRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.LoaiDichVu) && Enum.TryParse<LoaiDichVu>(request.LoaiDichVu, true, out var loai))
            {
                query = query.Where(x => x.LoaiDichVu == loai);
            }

            return await query
                .OrderBy(x => x.Ten)
                .Select(x => new DanhMucDichVuDto
                {
                    Id = x.Id,
                    Ma = x.Ma,
                    Ten = x.Ten,
                    LoaiDichVu = x.LoaiDichVu.ToString(),
                    DonViTinh = x.DonViTinh,
                    Gia = x.Gia
                })
                .ToListAsync(cancellationToken);
        }
    }
}
