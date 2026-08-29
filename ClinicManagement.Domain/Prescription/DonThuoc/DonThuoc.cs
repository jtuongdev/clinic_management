using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Prescription
{
    public class DonThuoc : BaseEntity, IAggregateRoot
    {
        public int MaLuotKham { get; private set; }
        public int MaBacSi { get; private set; }
        public int MaCoSo { get; private set; }
        public DateTime NgayKe { get; private set; }
        public TrangThaiDonThuoc TrangThai { get; private set; }
        public string GhiChu { get; private set; } = string.Empty;
        public DateTime? NgayCapThuoc { get; private set; }
        public int? MaNguoiCapThuoc { get; private set; } 
        public int? CreatedBy { get; private set; }

        public virtual LuotKham LuotKham { get; set; } = null!;
        public virtual NhanVien BacSi { get; set; } = null!;
        public virtual CoSo CoSo { get; set; } = null!;
        public virtual NhanVien? NguoiCapThuoc { get; set; } 
        public virtual ICollection<ChiTietDonThuoc> ChiTietDonThuocs { get; private set; }

        private DonThuoc() 
        {
            ChiTietDonThuocs = new List<ChiTietDonThuoc>();
        }

        public DonThuoc(int maLuotKham, int maBacSi, int maCoSo, int createdBy)
        {
            MaLuotKham = maLuotKham;
            MaBacSi = maBacSi;
            MaCoSo = maCoSo;
            CreatedBy = createdBy;
            NgayKe = DateTime.UtcNow;
            TrangThai = TrangThaiDonThuoc.TAM;
            ChiTietDonThuocs = new List<ChiTietDonThuoc>();
        }

        public void AddItem(int maItem, decimal soLuongKe, decimal donGiaKe, 
                           string? lieuDung = null, string? tanSuat = null, 
                           int? soNgay = null, string? huongDan = null)
        {
            if (soLuongKe <= 0 || donGiaKe < 0)
                throw new ArgumentException("Số lượng phải lớn hơn 0 và đơn giá không được âm.");

            ChiTietDonThuocs ??= new List<ChiTietDonThuoc>();

            var item = new ChiTietDonThuoc
            {
                MaDonThuoc = Id,
                MaItem = maItem,
                SoLuongKe = soLuongKe,
                DonGiaKe = donGiaKe,
                LieuDung = lieuDung ?? string.Empty,
                TanSuat = tanSuat ?? string.Empty,
                SoNgay = soNgay,
                HuongDan = huongDan ?? string.Empty
            };
            ChiTietDonThuocs.Add(item);
        }

        public void Approve()
        {
            if (TrangThai != TrangThaiDonThuoc.TAM)
                throw new InvalidOperationException("Chỉ có thể duyệt đơn thuốc đang ở trạng thái lưu tạm.");

            TrangThai = TrangThaiDonThuoc.DA_DUYET;
        }

        public void Cancel()
        {
            if (TrangThai == TrangThaiDonThuoc.DA_XUAT_HET)
                throw new InvalidOperationException("Không thể hủy đơn thuốc đã cấp phát.");

            TrangThai = TrangThaiDonThuoc.HUY;
        }

        public void CompleteDispense(int maNguoiCapThuoc)
        {
            if (TrangThai != TrangThaiDonThuoc.DA_DUYET)
                throw new InvalidOperationException("Chỉ có thể cấp phát thuốc cho đơn đã được duyệt.");

            TrangThai = TrangThaiDonThuoc.DA_XUAT_HET;
            NgayCapThuoc = DateTime.UtcNow;
            MaNguoiCapThuoc = maNguoiCapThuoc; 
        }

        public bool IsFullyDispensed() => TrangThai == TrangThaiDonThuoc.DA_XUAT_HET;
    }
}
