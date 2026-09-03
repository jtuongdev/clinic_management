using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Domain.Service
{
    public class ChiDinhDichVu : BaseEntity
    {
        public int MaLuotKham { get; set; }
        public int MaBacSiChiDinh { get; set; }
        public int MaDanhMuc { get; set; }
        public new int? CreatedBy { get; set; }
        public TrangThaiChiDinhDichVu TrangThai { get; set; }
        public DateTime NgayChiDinh { get; set; }
        public DateTime? NgayTiepNhan { get; set; }
        public DateTime? NgayThucHien { get; set; }
        public DateTime? NgayCoKetQua { get; set; }
        public int? MaNguoiThucHien { get; set; }
        public string KetLuan { get; set; } = string.Empty;
        public string UrlKetQua { get; set; } = string.Empty;

        public virtual LuotKham LuotKham { get; set; } = null!;
        public virtual NhanVien BacSiChiDinh { get; set; } = null!;
        public virtual DanhMucDichVu DanhMucDichVu { get; set; } = null!;
        public virtual NhanVien? NguoiThucHien { get; set; }
        public virtual ICollection<ChiTietKetQuaXetNghiem> ChiTietKetQuaXetNghiems { get; set; }

        public ChiDinhDichVu()
        {
            TrangThai = TrangThaiChiDinhDichVu.DaChiDinh;
            NgayChiDinh = DateTime.UtcNow;
            ChiTietKetQuaXetNghiems = new List<ChiTietKetQuaXetNghiem>();
        }

        public void Update(
            int maDanhMuc,
            int maBacSiChiDinh,
            int? maNguoiThucHien,
            string? trangThai,
            string? ketLuan,
            string? urlKetQua,
            DateTime? ngayThucHien,
            DateTime? ngayCoKetQua,
            int updatedBy)
        {
            if (maDanhMuc <= 0)
                throw new ArgumentException("Mã dịch vụ không hợp lệ.");

            MaDanhMuc = maDanhMuc;
            MaBacSiChiDinh = maBacSiChiDinh;
            MaNguoiThucHien = maNguoiThucHien;

            if (!string.IsNullOrWhiteSpace(trangThai) && Enum.TryParse<TrangThaiChiDinhDichVu>(trangThai, true, out var status))
                TrangThai = status;

            if (!string.IsNullOrWhiteSpace(ketLuan))
                KetLuan = ketLuan;

            if (!string.IsNullOrWhiteSpace(urlKetQua))
                UrlKetQua = urlKetQua;

            if (ngayThucHien.HasValue)
                NgayThucHien = ngayThucHien.Value;

            if (ngayCoKetQua.HasValue)
                NgayCoKetQua = ngayCoKetQua.Value;

            if (TrangThai == TrangThaiChiDinhDichVu.DaCoKetQua && string.IsNullOrWhiteSpace(KetLuan))
                throw new InvalidOperationException("Kết luận dịch vụ không được để trống khi đã có kết quả.");

            MarkAsUpdated(updatedBy);
        }

        public void TiepNhan()
        {
            if (TrangThai != TrangThaiChiDinhDichVu.DaChiDinh)
                throw new InvalidOperationException("Chỉ có thể tiếp nhận dịch vụ khi đang ở trạng thái vừa chỉ định (DaChiDinh).");

            TrangThai = TrangThaiChiDinhDichVu.DaTiepNhan;
            NgayTiepNhan = DateTime.UtcNow;
        }

        public void HoanThanh(int maNguoiThucHien, string ketLuan, string? urlKetQua = null)
        {
            if (TrangThai != TrangThaiChiDinhDichVu.DaTiepNhan)
                throw new InvalidOperationException("Chỉ có thể hoàn thành dịch vụ sau khi đã được tiếp nhận (DaTiepNhan).");

            if (string.IsNullOrWhiteSpace(ketLuan))
                throw new ArgumentException("Kết luận dịch vụ/xét nghiệm không được phép để trống.");

            TrangThai = TrangThaiChiDinhDichVu.DaCoKetQua;
            MaNguoiThucHien = maNguoiThucHien;
            KetLuan = ketLuan;
            UrlKetQua = urlKetQua ?? string.Empty;
            
            NgayThucHien = DateTime.UtcNow;
            NgayCoKetQua = DateTime.UtcNow;
        }

        public void HuyChiDinh()
        {
            if (TrangThai == TrangThaiChiDinhDichVu.DaCoKetQua)
                throw new InvalidOperationException("Không thể hủy dịch vụ khi đã có kết quả thực hiện (DaCoKetQua).");
            TrangThai = TrangThaiChiDinhDichVu.DaHuy;
        }
    }
}
