using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class CreateChiDinhDichVuCommandHandler : IRequestHandler<CreateChiDinhDichVuCommand, ChiDinhDichVuDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public CreateChiDinhDichVuCommandHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<ChiDinhDichVuDto> Handle(CreateChiDinhDichVuCommand request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Mã lượt khám không hợp lệ.");

            if (request.Data == null)
                throw new ArgumentNullException(nameof(request.Data));

            if (request.Data.MaDanhMuc <= 0)
                throw new ArgumentException("Mã dịch vụ không hợp lệ.");

            if (request.Data.MaBacSiChiDinh <= 0)
                throw new ArgumentException("Mã bác sĩ chỉ định không hợp lệ.");

            var luotKham = await _luotKhamRepository.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.LuotKhamId}.");

            luotKham.AddChiDinhDichVu(
                request.Data.MaDanhMuc,
                request.Data.MaBacSiChiDinh,
                request.Data.TrangThai,
                request.Data.MaNguoiThucHien,
                request.Data.KetLuan,
                request.Data.UrlKetQua,
                request.Data.NgayChiDinh,
                request.Data.NgayThucHien,
                request.Data.NgayCoKetQua,
                request.CreatedBy);

            _luotKhamRepository.Update(luotKham);
            await _luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

            var item = luotKham.ChiDinhDichVus
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefault();

            if (item == null)
                throw new InvalidOperationException("Tạo chỉ định dịch vụ thất bại.");

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
