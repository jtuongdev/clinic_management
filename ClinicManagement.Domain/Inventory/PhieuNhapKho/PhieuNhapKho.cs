using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Inventory
{
    public class PhieuNhapKho : BaseEntity, IAggregateRoot
    {
        public string MaPhieu { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public int MaKho { get; set; }
        public int MaNhaCungCap { get; set; }
        public DateTime NgayNhap { get; set; }
        public decimal TongTien { get; set; }
        public TrangThaiPhieuNhap TrangThai { get; set; }
        public int MaNguoiNhap { get; set; }
        public string GhiChu { get; set; } = string.Empty;
        public int? CreatedBy { get; set; }

        public virtual CoSo CoSo { get; set; } = null!;
        public virtual Kho Kho { get; set; } = null!;
        public virtual NhaCungCap NhaCungCap { get; set; } = null!;
        public virtual NhanVien NguoiNhap { get; set; } = null!;
        public virtual ICollection<ChiTietNhapKho> ChiTietNhapKhos { get; set; }

        public PhieuNhapKho()
        {
            ChiTietNhapKhos = new List<ChiTietNhapKho>();
            TrangThai = TrangThaiPhieuNhap.CHO_DUYET;
            NgayNhap = DateTime.UtcNow;
        }

        public void AddItem(Item item, decimal soLuong, decimal donGiaNhap, 
                           string? soLo = null, DateTime? hanSuDung = null, string? viTri = null)
        {
            if (item == null) throw new ArgumentNullException(nameof(item));
            if (soLuong <= 0 || donGiaNhap < 0)
                throw new ArgumentException("Số lượng phải lớn hơn 0 và đơn giá không được âm.");

            var chiTiet = new ChiTietNhapKho
            {
                MaPhieuNhap = Id,
                MaItem = item.Id,
                SoLuong = soLuong,
                DonGiaNhap = donGiaNhap,
                SoLo = soLo ?? string.Empty,
                HanSuDung = hanSuDung,
                ViTri = viTri ?? string.Empty
            };
            ChiTietNhapKhos.Add(chiTiet);
            TongTien += soLuong * donGiaNhap;
        }

        public void Approve()
        {
            if (TrangThai == TrangThaiPhieuNhap.DA_HUY)
                throw new InvalidOperationException("Không thể duyệt phiếu nhập kho đã bị hủy.");
            TrangThai = TrangThaiPhieuNhap.DA_NHAP;
        }

        public void Cancel()
        {
            if (TrangThai == TrangThaiPhieuNhap.DA_NHAP)
                throw new InvalidOperationException("Không thể hủy phiếu nhập kho đã hoàn tất nhập hàng.");
            TrangThai = TrangThaiPhieuNhap.DA_HUY;
        }
    }
}
