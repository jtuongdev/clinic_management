using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Inventory
{
    public class PhieuXuatKho : BaseEntity, IAggregateRoot
    {
        public string MaPhieu { get; set; } = string.Empty;
        public LoaiXuatKho LoaiXuat { get; set; }
        public int MaKhoXuat { get; set; }
        public int? MaKhoNhan { get; set; }
        public int? MaDonThuoc { get; set; }
        public DateTime NgayXuat { get; set; }
        public int MaNguoiXuat { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }

        // ── Cấp phát nội bộ Khoa/Phòng ──────────────────────────────────────
        /// <summary>Khoa/Phòng nhận vật tư (chỉ dùng cho LoaiXuat = XUAT_NOI_BO_KHOA_PHONG).</summary>
        public int? MaKhoaNhan { get; set; }

        /// <summary>Nhân viên/Trưởng khoa đại diện nhận hàng.</summary>
        public int? NguoiNhanId { get; set; }

        /// <summary>Trạng thái duyệt phiếu xuất cấp phát nội bộ.</summary>
        public TrangThaiXuatNoiBo? TrangThaiXuat { get; set; }

        // ── Navigation properties ────────────────────────────────────────────
        public virtual Kho KhoXuat { get; set; } = null!;
        public virtual Kho? KhoNhan { get; set; }
        public virtual Prescription.DonThuoc? DonThuoc { get; set; }
        public virtual NhanVien NguoiXuat { get; set; } = null!;
        public virtual Khoa? KhoaNhan { get; set; }
        public virtual NhanVien? NguoiNhan { get; set; }
        public virtual ICollection<ChiTietXuatKho> ChiTietXuatKhos { get; set; }

        public PhieuXuatKho()
        {
            ChiTietXuatKhos = new List<ChiTietXuatKho>();
            NgayXuat = DateTime.UtcNow;
        }

        // ── Business methods (xuất cấp phát nội bộ) ─────────────────────────

        /// <summary>Admin duyệt phiếu và kho sẽ tiến hành trừ tồn theo FEFO.</summary>
        public void Approve()
        {
            if (TrangThaiXuat != TrangThaiXuatNoiBo.ChoDuyet)
                throw new InvalidOperationException("Chỉ có thể duyệt phiếu đang ở trạng thái Chờ duyệt.");
            TrangThaiXuat = TrangThaiXuatNoiBo.DaDuyet;
        }

        /// <summary>Trưởng khoa xác nhận đã nhận đủ vật tư bàn giao.</summary>
        public void ConfirmReceived(int nguoiNhanId, string? ghiChu = null)
        {
            if (TrangThaiXuat != TrangThaiXuatNoiBo.DaDuyet)
                throw new InvalidOperationException("Chỉ có thể xác nhận nhận hàng khi phiếu đã được duyệt.");
            if (nguoiNhanId > 0)
            {
                NguoiNhanId = nguoiNhanId;
            }
            TrangThaiXuat = TrangThaiXuatNoiBo.DaNhanHang;
            if (!string.IsNullOrWhiteSpace(ghiChu))
            {
                GhiChu = string.IsNullOrWhiteSpace(GhiChu)
                    ? $"[Nhận hàng: {ghiChu.Trim()}]"
                    : $"{GhiChu} | [Nhận hàng: {ghiChu.Trim()}]";
            }
        }

        /// <summary>Admin từ chối yêu cầu xuất vật tư.</summary>
        public void Reject(string? lyDo)
        {
            if (TrangThaiXuat != TrangThaiXuatNoiBo.ChoDuyet)
                throw new InvalidOperationException("Chỉ có thể từ chối phiếu đang ở trạng thái Chờ duyệt.");
            TrangThaiXuat = TrangThaiXuatNoiBo.TuChoi;
            if (!string.IsNullOrWhiteSpace(lyDo))
                GhiChu = string.IsNullOrWhiteSpace(GhiChu)
                    ? $"[Từ chối: {lyDo.Trim()}]"
                    : $"{GhiChu} | [Từ chối: {lyDo.Trim()}]";
        }

        // ── Existing method (xuất trực tiếp không approval) ─────────────────
        public void AddItem(ChiTietNhapKho chiTietNhap, decimal soLuong, decimal donGiaXuat)
        {
            if (chiTietNhap == null) throw new ArgumentNullException(nameof(chiTietNhap));
            if (chiTietNhap.TonKho == null)
                throw new InvalidOperationException("Thông tin tồn kho của lô nhập này chưa được tải.");

            if (soLuong <= 0)
                throw new ArgumentException("Số lượng xuất kho phải lớn hơn 0.");

            if (soLuong > chiTietNhap.TonKho.SoLuongTon)
                throw new InvalidOperationException("Số lượng xuất vượt quá tồn kho");

            var chiTiet = new ChiTietXuatKho
            {
                MaPhieuXuat = Id,
                MaChiTietNhap = chiTietNhap.Id,
                SoLuongXuat = soLuong,
                DonGiaXuat = donGiaXuat
            };
            ChiTietXuatKhos.Add(chiTiet);
            
            chiTietNhap.TonKho.SubtractQuantity(soLuong);
        }
    }
}
