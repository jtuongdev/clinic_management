using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Payroll
{
    public class BangLuong : BaseEntity
    {
        public int MaKyLuong { get; private set; }
        public int MaNhanVien { get; private set; }
        public decimal LuongCoBan { get; private set; }
        public decimal SoNgayCong { get; private set; }
        public decimal SoNgayNghiKhongLuong { get; private set; }
        public decimal TongPhuCap { get; private set; }
        public decimal TongKhauTru { get; private set; }
        public decimal ThucLinh { get; private set; }

        public virtual KyLuong KyLuong { get; private set; } = null!;
        public virtual NhanVien NhanVien { get; private set; } = null!;
        public virtual ICollection<ChiTietBangLuong> ChiTiets { get; private set; }

        private BangLuong()
        {
            ChiTiets = new List<ChiTietBangLuong>();
        }

        public BangLuong(int maKyLuong, int maNhanVien, decimal luongCoBan)
        {
            if (maKyLuong <= 0)
                throw new ArgumentOutOfRangeException(nameof(maKyLuong));
            if (maNhanVien <= 0)
                throw new ArgumentOutOfRangeException(nameof(maNhanVien));
            if (luongCoBan < 0)
                throw new ArgumentOutOfRangeException(nameof(luongCoBan));

            MaKyLuong = maKyLuong;
            MaNhanVien = maNhanVien;
            LuongCoBan = luongCoBan;
            ChiTiets = new List<ChiTietBangLuong>();
            Recalculate();
        }

        public void SetAttendance(decimal soNgayCong, decimal soNgayNghiKhongLuong)
        {
            if (soNgayCong < 0 || soNgayNghiKhongLuong < 0)
                throw new ArgumentOutOfRangeException(nameof(soNgayCong));

            SoNgayCong = soNgayCong;
            SoNgayNghiKhongLuong = soNgayNghiKhongLuong;
            Recalculate();
        }

        public void AddItem(string loaiKhoan, string tenKhoan, decimal soTien, string ghiChu = "")
        {
            var item = new ChiTietBangLuong(Id, loaiKhoan, tenKhoan, soTien, ghiChu);
            ChiTiets.Add(item);
            Recalculate();
        }

        private void Recalculate()
        {
            TongPhuCap = 0;
            TongKhauTru = 0;

            foreach (var item in ChiTiets)
            {
                if (item.LoaiKhoan == "PHU_CAP")
                    TongPhuCap += item.SoTien;
                else if (item.LoaiKhoan == "KHAU_TRU")
                    TongKhauTru += item.SoTien;
            }

            ThucLinh = LuongCoBan + TongPhuCap - TongKhauTru;
            if (ThucLinh < 0)
                throw new InvalidOperationException("Thực lĩnh không thể âm.");
        }
    }
}
