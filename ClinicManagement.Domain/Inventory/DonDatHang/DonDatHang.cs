using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Inventory
{
    public class DonDatHang : BaseEntity, IAggregateRoot
    {
        public string MaDonDatHang { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public int MaKho { get; set; }
        public int MaNhaCungCap { get; set; }
        public DateTime NgayDat { get; set; }
        public DateTime? NgayDuKienGiao { get; set; }
        public decimal TongTien { get; set; }
        public TrangThaiDonDatHang TrangThai { get; set; }
        public int MaNguoiDat { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }

        public virtual CoSo CoSo { get; set; } = null!;
        public virtual Kho Kho { get; set; } = null!;
        public virtual NhaCungCap NhaCungCap { get; set; } = null!;
        public virtual NhanVien NguoiDat { get; set; } = null!;
        public virtual ICollection<ChiTietDonDatHang> ChiTietDonDatHangs { get; set; }
        public virtual ICollection<PhieuNhapKho> PhieuNhapKhos { get; set; }

        public DonDatHang()
        {
            ChiTietDonDatHangs = new List<ChiTietDonDatHang>();
            PhieuNhapKhos = new List<PhieuNhapKho>();
            TrangThai = TrangThaiDonDatHang.CHO_DUYET;
            NgayDat = DateTime.UtcNow;
        }

        public void AddLine(Item item, decimal soLuongDat, decimal donGiaDat, string? donViTinh = null, int? maQuyDoi = null, string? ghiChu = null)
        {
            if (item == null) throw new ArgumentNullException(nameof(item));
            if (soLuongDat <= 0 || donGiaDat < 0)
                throw new ArgumentException("Số lượng đặt phải lớn hơn 0 và đơn giá không được âm.");

            var line = new ChiTietDonDatHang
            {
                MaDonDatHang = Id,
                MaItem = item.Id,
                MaQuyDoi = maQuyDoi,
                DonViTinh = donViTinh ?? item.DonViTinhCoBan,
                SoLuongDat = soLuongDat,
                SoLuongDaNhap = 0,
                DonGiaDat = donGiaDat,
                GhiChu = ghiChu ?? string.Empty
            };
            ChiTietDonDatHangs.Add(line);
            TongTien += soLuongDat * donGiaDat;
        }

        public void RecalculateStatus()
        {
            if (TrangThai == TrangThaiDonDatHang.DA_HUY) return;

            bool anyReceived = false;
            bool allFullyReceived = ChiTietDonDatHangs.Count > 0;

            foreach (var detail in ChiTietDonDatHangs)
            {
                if (detail.SoLuongDaNhap > 0)
                    anyReceived = true;

                if (detail.SoLuongDaNhap < detail.SoLuongDat)
                    allFullyReceived = false;
            }

            if (allFullyReceived)
            {
                TrangThai = TrangThaiDonDatHang.HOAN_THANH;
            }
            else if (anyReceived)
            {
                TrangThai = TrangThaiDonDatHang.GIAO_MOT_PHAN;
            }
            else if (TrangThai != TrangThaiDonDatHang.CHO_DUYET)
            {
                TrangThai = TrangThaiDonDatHang.DA_DAT;
            }
        }
    }
}
