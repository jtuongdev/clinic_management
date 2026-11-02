using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.Features.Kho;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class CapNhatChiDinhDichVuCommandHandler : IRequestHandler<CapNhatChiDinhDichVuCommand, ChiDinhDichVuDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;
        private readonly IKhoRepository? _khoRepository;
        private readonly IInventorySettings? _inventorySettings;
        private readonly ILogger<CapNhatChiDinhDichVuCommandHandler>? _logger;

        public CapNhatChiDinhDichVuCommandHandler(
            ILuotKhamRepository luotKhamRepository,
            IKhoRepository? khoRepository = null,
            IInventorySettings? inventorySettings = null,
            ILogger<CapNhatChiDinhDichVuCommandHandler>? logger = null)
        {
            _luotKhamRepository = luotKhamRepository;
            _khoRepository = khoRepository;
            _inventorySettings = inventorySettings;
            _logger = logger;
        }

        public async Task<ChiDinhDichVuDto> Handle(CapNhatChiDinhDichVuCommand request, CancellationToken cancellationToken)
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

            var previousStatus = item.TrangThai;

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

            // ⚠️ AUTO-DEDUCT ĐÃ TẮT — Chuyển sang mô hình xuất cấp phát nội bộ theo Khoa/Phòng.
            // Vật tư tiêu hao được quản lý qua PhieuXuatKho.LoaiXuat = XUAT_NOI_BO_KHOA_PHONG.
            // Tham chiếu: CapPhatKhoa.InventoryController.cs / DepartmentDispense.KhoService.cs
            //
            // if (item.TrangThai == ClinicManagement.Domain.Common.Enums.TrangThaiChiDinhDichVu.DaCoKetQua &&
            //     previousStatus != ClinicManagement.Domain.Common.Enums.TrangThaiChiDinhDichVu.DaCoKetQua &&
            //     _khoRepository != null)
            // {
            //     await DinhMucVatTuHelper.DeductSuppliesForServiceAsync(
            //         _khoRepository,
            //         item,
            //         request.UpdatedBy,
            //         _inventorySettings?.DefaultWarehouseId ?? 1,
            //         _logger,
            //         cancellationToken);
            // }

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
