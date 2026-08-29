using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Patient;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Service;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Domain.Examination
{
    public class LuotKham : BaseEntity, IAggregateRoot
    {
        public int MaBenhNhan { get; private set; }
        public int? MaBacSi { get; private set; }
        public int? MaLichHen { get; private set; }
        public int MaCoSo { get; private set; } 
        public int MaKhoa { get; private set; }
        public HinhThucDieuTri HinhThucDieuTri { get; private set; }
        public TrangThaiLuotKham TrangThai { get; private set; }
        public int? SoThuTu { get; private set; }
        public DateTime NgayKham { get; private set; }
        public DateTime? ThoiGianBatDauKham { get; private set; }
        public DateTime? ThoiGianKetThucKham { get; private set; }
        public string LyDoKham { get; private set; } = string.Empty;
        public int? MaPhongKham { get; private set; }
        public int? CreatedBy { get; private set; }

        public virtual BenhNhan BenhNhan { get; set; } = null!;
        public virtual NhanVien BacSi { get; set; } = null!;
        public virtual LichHen? LichHen { get; set; }
        public virtual CoSo CoSo { get; set; } = null!;
        public virtual Khoa Khoa { get; set; } = null!;
        public virtual ICollection<ChanDoan> ChanDoans { get; set; }
        public virtual ICollection<SinhHieu> SinhHieus { get; set; }
        public virtual ICollection<ChiDinhDichVu> ChiDinhDichVus { get; set; } 
        public virtual ICollection<DonThuoc> DonThuocs { get; set; }
        public virtual ICollection<HoaDon> HoaDons { get; set; }
        public virtual Facility.PhongKham? PhongKham { get; set; } 

        private LuotKham() 
        {
            ChanDoans = new List<ChanDoan>();
            SinhHieus = new List<SinhHieu>();
            ChiDinhDichVus = new List<ChiDinhDichVu>();
            DonThuocs = new List<DonThuoc>();
            HoaDons = new List<HoaDon>();
        }

        public LuotKham(
            int maBenhNhan,
            int maCoSo,
            int maKhoa,
            int soThuTu,        
            int? maBacSi = null,
            int? maLichHen = null,
            int? maPhongKham = null)
        {
            MaBenhNhan = maBenhNhan;
            MaCoSo = maCoSo;
            MaKhoa = maKhoa;
            SoThuTu = soThuTu;   
            MaBacSi = maBacSi;
            MaLichHen = maLichHen;
            MaPhongKham = maPhongKham;

            TrangThai = TrangThaiLuotKham.CHO_KHAM;
            NgayKham = DateTime.UtcNow.Date;
            HinhThucDieuTri = HinhThucDieuTri.NGOAI_TRU;

            ChanDoans = new List<ChanDoan>();
            SinhHieus = new List<SinhHieu>();
            ChiDinhDichVus = new List<ChiDinhDichVu>();
            DonThuocs = new List<DonThuoc>();
            HoaDons = new List<HoaDon>();
        }

        public void StartExam()
        {
            if (TrangThai != TrangThaiLuotKham.CHO_KHAM) 
                throw new InvalidOperationException("Chỉ có thể bắt đầu khám cho lượt khám đang ở trạng thái chờ khám.");

            TrangThai = TrangThaiLuotKham.DANG_KHAM; 
            ThoiGianBatDauKham = DateTime.UtcNow;
        }

        public void CompleteExam()
        {
            if (TrangThai != TrangThaiLuotKham.DANG_KHAM) 
                throw new InvalidOperationException("Chỉ có thể hoàn thành lượt khám khi đang trong tiến trình khám.");

            TrangThai = TrangThaiLuotKham.HOAN_THANH; 
            ThoiGianKetThucKham = DateTime.UtcNow;
        }

        public void CancelExam()
        {
            if (TrangThai == TrangThaiLuotKham.HOAN_THANH) 
                throw new InvalidOperationException("Không thể hủy một lượt khám đã hoàn thành.");

            TrangThai = TrangThaiLuotKham.DA_HUY; 
        }

        public void AddChanDoan(string maICD, string tenChanDoan, bool laChinh, string ghiChu, int createdBy)
        {
            ChanDoans ??= new List<ChanDoan>();

            var chanDoan = new ChanDoan
            {
                MaLuotKham = Id,
                MaICD = maICD,
                TenChanDoan = tenChanDoan,
                LaChanDoanChinh = laChinh,
                GhiChu = ghiChu,
                CreatedBy = createdBy
            };
            ChanDoans.Add(chanDoan);
        }

        public void AddSinhHieu(int? huyetApTamThu, int? huyetApTamTruong, int? mach, 
                               decimal? nhietDo, decimal? canNang, decimal? chieuCao, decimal? spO2)
        {
            SinhHieus ??= new List<SinhHieu>();

            var sinhHieu = new SinhHieu
            {
                MaLuotKham = Id,
                HuyetApTamThu = huyetApTamThu,
                HuyetApTamTruong = huyetApTamTruong,
                Mach = mach,
                NhietDo = nhietDo,
                CanNang = canNang,
                ChieuCao = chieuCao,
                SpO2 = spO2
            };
            SinhHieus.Add(sinhHieu);
        }
        public void AssignDoctor(int maBacSi)
        {
            if (TrangThai != TrangThaiLuotKham.CHO_KHAM)
                throw new InvalidOperationException(
                    "Chỉ có thể phân bác sĩ cho lượt khám đang chờ khám.");
            MaBacSi = maBacSi;
        }

    }
}
