using System;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class TiepNhanChiDinhCommandHandler : IRequestHandler<TiepNhanChiDinhCommand, ChiDinhDichVuDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public TiepNhanChiDinhCommandHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<ChiDinhDichVuDto> Handle(TiepNhanChiDinhCommand request, CancellationToken cancellationToken)
        {
            if (request.ChiDinhId <= 0)
                throw new ArgumentException("Mã chỉ định dịch vụ không hợp lệ.");

            var item = await _luotKhamRepository.GetChiDinhDichVuByIdAsync(request.ChiDinhId, cancellationToken);
            if (item == null)
                throw new KeyNotFoundException($"Không tìm thấy chỉ định dịch vụ có mã {request.ChiDinhId}.");

            item.TiepNhan();
            if (request.MaNguoiThucHien.HasValue && request.MaNguoiThucHien.Value > 0)
            {
                item.MaNguoiThucHien = request.MaNguoiThucHien.Value;
            }
            item.MarkAsUpdated(request.UpdatedBy > 0 ? request.UpdatedBy : 1);

            await _luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new ChiDinhDichVuDto
            {
                Id = item.Id,
                TenDichVu = item.DanhMucDichVu?.Ten ?? string.Empty,
                LoaiDichVu = item.DanhMucDichVu?.LoaiDichVu.ToString() ?? string.Empty,
                TrangThai = item.TrangThai.ToString(),
                NgayChiDinh = item.NgayChiDinh,
                NgayThucHien = item.NgayThucHien,
                NgayCoKetQua = item.NgayCoKetQua,
                KetLuan = item.KetLuan,
                UrlKetQua = item.UrlKetQua
            };
        }
    }
}
