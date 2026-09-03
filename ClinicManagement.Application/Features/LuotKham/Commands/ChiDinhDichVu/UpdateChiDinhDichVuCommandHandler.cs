using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class UpdateChiDinhDichVuCommandHandler : IRequestHandler<UpdateChiDinhDichVuCommand, ChiDinhDichVuDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public UpdateChiDinhDichVuCommandHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<ChiDinhDichVuDto> Handle(UpdateChiDinhDichVuCommand request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Mã lượt khám không hợp lệ.");

            if (request.ChiDinhDichVuId <= 0)
                throw new ArgumentException("Mã chỉ định dịch vụ không hợp lệ.");

            if (request.Data == null)
                throw new ArgumentNullException(nameof(request.Data));

            var luotKham = await _luotKhamRepository.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.LuotKhamId}.");

            var item = luotKham.ChiDinhDichVus
                .FirstOrDefault(x => x.Id == request.ChiDinhDichVuId && !x.IsDeleted);

            if (item == null)
                throw new KeyNotFoundException($"Không tìm thấy chỉ định dịch vụ {request.ChiDinhDichVuId}.");

            item.Update(
                request.Data.MaDanhMuc > 0 ? request.Data.MaDanhMuc : item.MaDanhMuc,
                request.Data.MaBacSiChiDinh > 0 ? request.Data.MaBacSiChiDinh : item.MaBacSiChiDinh,
                request.Data.MaNguoiThucHien ?? item.MaNguoiThucHien,
                request.Data.TrangThai,
                request.Data.KetLuan ?? item.KetLuan,
                request.Data.UrlKetQua ?? item.UrlKetQua,
                request.Data.NgayThucHien ?? item.NgayThucHien,
                request.Data.NgayCoKetQua ?? item.NgayCoKetQua,
                request.UpdatedBy);

            _luotKhamRepository.Update(luotKham);
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
