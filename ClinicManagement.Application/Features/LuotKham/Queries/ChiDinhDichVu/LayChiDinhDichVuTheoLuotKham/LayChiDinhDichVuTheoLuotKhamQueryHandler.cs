using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries.ChiDinhDichVu
{
    public class LayChiDinhDichVuTheoLuotKhamQueryHandler : IRequestHandler<LayChiDinhDichVuTheoLuotKhamQuery, List<ChiDinhDichVuDto>>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public LayChiDinhDichVuTheoLuotKhamQueryHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<List<ChiDinhDichVuDto>> Handle(LayChiDinhDichVuTheoLuotKhamQuery request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Mã lượt khám không hợp lệ.");

            var luotKham = await _luotKhamRepository.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.LuotKhamId}.");

            return luotKham.ChiDinhDichVus
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.NgayChiDinh)
                .Select(x => new ChiDinhDichVuDto
                {
                    Id = x.Id,
                    TenDichVu = x.DanhMucDichVu?.Ten ?? string.Empty,
                    LoaiDichVu = x.DanhMucDichVu?.LoaiDichVu.ToString() ?? string.Empty,
                    TrangThai = x.TrangThai.ToString(),
                    NgayChiDinh = x.NgayChiDinh,
                    NgayThucHien = x.NgayThucHien,
                    NgayCoKetQua = x.NgayCoKetQua,
                    KetLuan = x.KetLuan,
                    UrlKetQua = x.UrlKetQua
                })
                .ToList();
        }
    }
}
