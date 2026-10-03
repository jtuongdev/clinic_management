using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.Features.Kho;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChiDinhDichVu
{
    public class NhapKetQuaChiDinhCommandHandler : IRequestHandler<NhapKetQuaChiDinhCommand, ChiDinhDichVuDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;
        private readonly IKhoRepository? _khoRepository;
        private readonly IInventorySettings? _inventorySettings;
        private readonly ILogger<NhapKetQuaChiDinhCommandHandler>? _logger;

        public NhapKetQuaChiDinhCommandHandler(
            ILuotKhamRepository luotKhamRepository,
            IKhoRepository? khoRepository = null,
            IInventorySettings? inventorySettings = null,
            ILogger<NhapKetQuaChiDinhCommandHandler>? logger = null)
        {
            _luotKhamRepository = luotKhamRepository;
            _khoRepository = khoRepository;
            _inventorySettings = inventorySettings;
            _logger = logger;
        }

        public async Task<ChiDinhDichVuDto> Handle(NhapKetQuaChiDinhCommand request, CancellationToken cancellationToken)
        {
            if (request.ChiDinhId <= 0)
                throw new ArgumentException("Mã chỉ định dịch vụ không hợp lệ.");

            if (request.Data == null)
                throw new ArgumentNullException(nameof(request.Data));

            var item = await _luotKhamRepository.GetChiDinhDichVuByIdAsync(request.ChiDinhId, cancellationToken);
            if (item == null)
                throw new KeyNotFoundException($"Không tìm thấy chỉ định dịch vụ có mã {request.ChiDinhId}.");

            var previousStatus = item.TrangThai;
            var userId = request.UpdatedBy > 0 ? request.UpdatedBy : 1;

            if (request.Data.MaNguoiThucHien.HasValue && request.Data.MaNguoiThucHien.Value > 0)
                item.MaNguoiThucHien = request.Data.MaNguoiThucHien.Value;

            if (!string.IsNullOrWhiteSpace(request.Data.KetLuan))
                item.KetLuan = request.Data.KetLuan;

            if (!string.IsNullOrWhiteSpace(request.Data.UrlKetQua))
                item.UrlKetQua = request.Data.UrlKetQua;

            // Cập nhật danh sách chỉ số xét nghiệm (nếu có)
            if (request.Data.ChiTietKetQuas != null)
            {
                item.ChiTietKetQuaXetNghiems.Clear();
                foreach (var ct in request.Data.ChiTietKetQuas)
                {
                    item.ChiTietKetQuaXetNghiems.Add(new ChiTietKetQuaXetNghiem
                    {
                        MaChiDinh = item.Id,
                        TenChiSo = ct.TenChiSo ?? string.Empty,
                        GiaTri = ct.GiaTri ?? string.Empty,
                        DonVi = ct.DonVi ?? string.Empty,
                        KhoangThamChieu = ct.KhoangThamChieu ?? string.Empty,
                        BatThuong = ct.BatThuong
                    });
                }
            }

            if (request.Data.HoanThanh)
            {
                if (item.TrangThai == TrangThaiChiDinhDichVu.DaChiDinh)
                {
                    item.TiepNhan();
                }

                item.HoanThanh(
                    item.MaNguoiThucHien ?? userId,
                    !string.IsNullOrWhiteSpace(item.KetLuan) ? item.KetLuan : "Bình thường",
                    item.UrlKetQua);

                // ⚠️ AUTO-DEDUCT ĐÃ TẮT — Chuyển sang mô hình xuất cấp phát nội bộ theo Khoa/Phòng.
                // Vật tư tiêu hao được quản lý qua PhieuXuatKho.LoaiXuat = XUAT_NOI_BO_KHOA_PHONG.
                // Tham chiếu: CapPhatKhoa.InventoryController.cs / DepartmentDispense.KhoService.cs
                //
                // if (previousStatus != TrangThaiChiDinhDichVu.DaCoKetQua && _khoRepository != null)
                // {
                //     await DinhMucVatTuHelper.DeductSuppliesForServiceAsync(
                //         _khoRepository,
                //         item,
                //         userId,
                //         _inventorySettings?.DefaultWarehouseId ?? 1,
                //         _logger,
                //         cancellationToken);
                // }
            }
            else
            {
                item.TrangThai = TrangThaiChiDinhDichVu.ChoKetQua;
                item.NgayThucHien = DateTime.UtcNow;
            }

            item.MarkAsUpdated(userId);
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
