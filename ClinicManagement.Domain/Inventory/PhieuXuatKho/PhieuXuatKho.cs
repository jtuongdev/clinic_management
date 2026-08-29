using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
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

        public virtual Kho KhoXuat { get; set; } = null!;
        public virtual Kho? KhoNhan { get; set; }
        public virtual Prescription.DonThuoc? DonThuoc { get; set; }
        public virtual NhanVien NguoiXuat { get; set; } = null!;
        public virtual ICollection<ChiTietXuatKho> ChiTietXuatKhos { get; set; }

        public PhieuXuatKho()
        {
            ChiTietXuatKhos = new List<ChiTietXuatKho>();
            NgayXuat = DateTime.UtcNow;
        }

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
