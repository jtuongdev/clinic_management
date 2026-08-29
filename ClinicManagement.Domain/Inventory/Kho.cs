using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;
using System;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Inventory
{
    public class Kho : BaseEntity
    {
        public int MaCoSo { get; set; }
        public int? MaKhoa { get; set; }
        public string TenKho { get; set; } = string.Empty;
        public LoaiKho LoaiKho { get; set; }
        public int? MaNguoiPhuTrach { get; set; }
        public string DiaChi { get; set; } = string.Empty;
        public TrangThaiKho TrangThai { get; set; } 

        public virtual CoSo CoSo { get; set; } = null!;
        public virtual Khoa? Khoa { get; set; }
        public virtual NhanVien? NguoiPhuTrach { get; set; } 
        public virtual ICollection<TonKho> TonKhos { get; set; }
        public virtual ICollection<PhieuNhapKho> PhieuNhapKhos { get; set; }
        public virtual ICollection<PhieuXuatKho> PhieuXuatKhos { get; set; }

        public Kho()
        {
            TrangThai = TrangThaiKho.HoatDong;
            TonKhos = new List<TonKho>();
            PhieuNhapKhos = new List<PhieuNhapKho>();
            PhieuXuatKhos = new List<PhieuXuatKho>();
        }

        public void TamNgungHoatDong()
        {
            if (TrangThai == TrangThaiKho.DongCua)
                throw new InvalidOperationException("Không thể tạm ngưng một kho đã đóng cửa vĩnh viễn.");

            TrangThai = TrangThaiKho.TamNgung;
        }

        public void KichHoatLai()
        {
            TrangThai = TrangThaiKho.HoatDong;
        }

        public void DongCuaKho()
        {
            TrangThai = TrangThaiKho.DongCua;
        }

        public void ThayDoiNguoiPhuTrach(int maNguoiMoi)
        {
            if (maNguoiMoi <= 0)
                throw new ArgumentException("Mã người phụ trách mới không hợp lệ.");

            MaNguoiPhuTrach = maNguoiMoi;
        }
    }
}
