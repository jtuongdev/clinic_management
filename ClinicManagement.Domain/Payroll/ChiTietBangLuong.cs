using System;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Payroll
{
    public class ChiTietBangLuong : BaseEntity
    {
        public int MaBangLuong { get; private set; }
        public string LoaiKhoan { get; private set; } = string.Empty;
        public string TenKhoan { get; private set; } = string.Empty;
        public decimal SoTien { get; private set; }
        public string GhiChu { get; private set; } = string.Empty;

        public virtual BangLuong BangLuong { get; private set; } = null!;

        private ChiTietBangLuong() { }

        public ChiTietBangLuong(int maBangLuong, string loaiKhoan, string tenKhoan, decimal soTien, string ghiChu = "")
        {
            if (maBangLuong < 0)
                throw new ArgumentOutOfRangeException(nameof(maBangLuong));
            if (loaiKhoan != "PHU_CAP" && loaiKhoan != "KHAU_TRU")
                throw new ArgumentException("Loại khoản phải là PHU_CAP hoặc KHAU_TRU.", nameof(loaiKhoan));
            if (string.IsNullOrWhiteSpace(tenKhoan))
                throw new ArgumentException("Tên khoản không được để trống.", nameof(tenKhoan));
            if (soTien < 0)
                throw new ArgumentOutOfRangeException(nameof(soTien));

            MaBangLuong = maBangLuong;
            LoaiKhoan = loaiKhoan;
            TenKhoan = tenKhoan;
            SoTien = soTien;
            GhiChu = ghiChu ?? string.Empty;
        }
    }
}
