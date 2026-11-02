using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using System.Collections.Generic;

namespace ClinicManagement.Domain.Inventory
{
    public class NhaCungCap : BaseEntity
    {
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string DienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string MaSoThue { get; set; } = string.Empty;
        public TrangThaiNhaCungCap TrangThai { get; set; } = TrangThaiNhaCungCap.HoatDong;

        public virtual ICollection<PhieuNhapKho> PhieuNhapKhos { get; set; }

        public NhaCungCap()
        {
            PhieuNhapKhos = new List<PhieuNhapKho>();
        }
    }
}
