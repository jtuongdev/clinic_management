using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Application.Features.Kho;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.LuotKham.Queries.ChiDinhDichVu
{
    public class LayChiTietChiDinhQueryHandler : IRequestHandler<LayChiTietChiDinhQuery, ChiDinhDichVuChiTietDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;
        private readonly IKhoRepository? _khoRepository;

        public LayChiTietChiDinhQueryHandler(
            ILuotKhamRepository luotKhamRepository,
            IKhoRepository? khoRepository = null)
        {
            _luotKhamRepository = luotKhamRepository;
            _khoRepository = khoRepository;
        }

        public async Task<ChiDinhDichVuChiTietDto> Handle(LayChiTietChiDinhQuery request, CancellationToken cancellationToken)
        {
            if (request.ChiDinhId <= 0)
                throw new ArgumentException("Mã chỉ định dịch vụ không hợp lệ.");

            var cd = await _luotKhamRepository.GetChiDinhDichVuByIdAsync(request.ChiDinhId, cancellationToken);
            if (cd == null)
                throw new KeyNotFoundException($"Không tìm thấy chỉ định dịch vụ có mã {request.ChiDinhId}.");

            var bn = cd.LuotKham?.BenhNhan;
            var chanDoanSoBo = cd.LuotKham?.ChanDoans?
                .Where(c => !c.IsDeleted)
                .OrderByDescending(c => c.LaChanDoanChinh)
                .Select(c => c.TenChanDoan ?? c.ICD?.TenICD ?? string.Empty)
                .FirstOrDefault() ?? string.Empty;

            var chiTietKetQuas = cd.ChiTietKetQuaXetNghiems?
                .Where(x => !x.IsDeleted)
                .Select(x => new ChiTietKetQuaXetNghiemDto
                {
                    TenChiSo = x.TenChiSo,
                    GiaTri = x.GiaTri,
                    DonVi = x.DonVi,
                    KhoangThamChieu = x.KhoangThamChieu,
                    BatThuong = x.BatThuong
                })
                .ToList() ?? new List<ChiTietKetQuaXetNghiemDto>();

            var vatTuSuDungs = new List<VatTuSuDungDto>();
            if (_khoRepository != null)
            {
                var boms = await _khoRepository.DinhMucVatTuDichVus
                    .Where(x => x.MaDanhMucDichVu == cd.MaDanhMuc && !x.IsDeleted)
                    .ToListAsync(cancellationToken);

                var referenceCode = $"DV-{cd.Id}";
                var transactions = await _khoRepository.InventoryTransactions
                    .Include(x => x.Item)
                    .Where(x => x.MaChungTu == referenceCode)
                    .ToListAsync(cancellationToken);

                // Tìm phiếu xuất kho liên quan
                var exportReceipt = await _khoRepository.PhieuXuatKhos
                    .FirstOrDefaultAsync(x => x.GhiChu.Contains($"#{cd.Id}"), cancellationToken);

                // Kiểm tra các vật tư đã xuất cho dịch vụ khác trong cùng lượt khám
                var siblingServiceOrderIds = await _khoRepository.LuotKhams
                    .Where(x => x.Id == cd.MaLuotKham)
                    .SelectMany(x => x.ChiDinhDichVus)
                    .Where(x => x.Id != cd.Id && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync(cancellationToken);

                var previouslyDeductedItemIds = new HashSet<int>();
                if (siblingServiceOrderIds.Count > 0)
                {
                    var siblingRefCodes = siblingServiceOrderIds.Select(id => $"DV-{id}").ToList();
                    var deducted = await _khoRepository.InventoryTransactions
                        .Where(x => siblingRefCodes.Contains(x.MaChungTu))
                        .Select(x => x.MaItem)
                        .Distinct()
                        .ToListAsync(cancellationToken);
                    foreach (var id in deducted) previouslyDeductedItemIds.Add(id);
                }

                foreach (var bom in boms)
                {
                    var item = await _khoRepository.Items.FirstOrDefaultAsync(x => x.Id == bom.MaItem, cancellationToken);
                    var tx = transactions.FirstOrDefault(x => x.MaItem == bom.MaItem);

                    string trangThai;
                    decimal soLuongXuat = 0;
                    string soLo = "";
                    string maPhieuXuat = exportReceipt?.MaPhieu ?? "";

                    if (tx != null)
                    {
                        trangThai = "Đã xuất kho nội bộ";
                        soLuongXuat = Math.Abs(tx.SoLuongThayDoi);
                        soLo = tx.SoLo;
                        if (string.IsNullOrEmpty(maPhieuXuat)) maPhieuXuat = tx.MaChungTu;
                    }
                    else if (previouslyDeductedItemIds.Contains(bom.MaItem) && DinhMucVatTuHelper.IsSharedSamplingItem(item?.Ten ?? "", bom.GhiChu))
                    {
                        trangThai = "Miễn trừ (Dùng chung trong lượt khám)";
                    }
                    else if (cd.TrangThai == TrangThaiChiDinhDichVu.DaCoKetQua)
                    {
                        trangThai = "Không phát sinh xuất (Hết tồn kho hoặc định mức 0)";
                    }
                    else
                    {
                        trangThai = "Chờ thực hiện";
                    }

                    vatTuSuDungs.Add(new VatTuSuDungDto
                    {
                        MaItem = bom.MaItem,
                        MaVatTu = item?.Ma ?? string.Empty,
                        TenVatTu = item?.Ten ?? string.Empty,
                        SoLuongDinhMuc = bom.SoLuong,
                        DonViTinh = bom.DonViTinh,
                        SoLuongXuat = soLuongXuat,
                        DonViTinhKho = item?.DonViTinhCoBan ?? bom.DonViTinh,
                        SoLo = soLo,
                        MaPhieuXuat = maPhieuXuat,
                        TrangThai = trangThai,
                        GhiChu = bom.GhiChu
                    });
                }
            }

            return new ChiDinhDichVuChiTietDto
            {
                Id = cd.Id,
                MaLuotKham = cd.MaLuotKham,
                MaBenhNhan = bn?.Id ?? 0,
                MaBenhNhanNoiBo = bn?.BenhNhanCoSo?.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                TenBenhNhan = bn != null ? $"{bn.Ho} {bn.Ten}".Trim() : string.Empty,
                Tuoi = bn != null ? DateTime.UtcNow.Year - bn.NgaySinh.Year : null,
                GioiTinh = bn?.GioiTinh.ToString() ?? string.Empty,
                DienThoai = bn?.DienThoai ?? string.Empty,
                DiaChi = bn?.DiaChi ?? string.Empty,
                MaDanhMucDichVu = cd.MaDanhMuc,
                TenDichVu = cd.DanhMucDichVu?.Ten ?? string.Empty,
                LoaiDichVu = cd.DanhMucDichVu?.LoaiDichVu.ToString() ?? string.Empty,
                MaBacSiChiDinh = cd.MaBacSiChiDinh,
                TenBacSiChiDinh = cd.BacSiChiDinh?.HoTen ?? string.Empty,
                MaKhoa = cd.LuotKham?.MaKhoa ?? 0,
                TenKhoa = cd.LuotKham?.Khoa?.Ten ?? string.Empty,
                MaNguoiThucHien = cd.MaNguoiThucHien,
                TenNguoiThucHien = cd.NguoiThucHien?.HoTen ?? string.Empty,
                TrangThai = cd.TrangThai.ToString(),
                NgayChiDinh = cd.NgayChiDinh,
                NgayTiepNhan = cd.NgayTiepNhan,
                NgayThucHien = cd.NgayThucHien,
                NgayCoKetQua = cd.NgayCoKetQua,
                KetLuan = cd.KetLuan,
                UrlKetQua = cd.UrlKetQua,
                ChanDoanSoBo = chanDoanSoBo,
                ChiTietKetQuas = chiTietKetQuas,
                VatTuSuDungs = vatTuSuDungs
            };
        }
    }
}
