using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class ChiTietKetQuaItemRequest
    {
        public string TenChiSo { get; set; } = string.Empty;
        public string GiaTri { get; set; } = string.Empty;
        public string DonVi { get; set; } = string.Empty;
        public string KhoangThamChieu { get; set; } = string.Empty;
        public bool? BatThuong { get; set; }
    }

    public class NhapKetQuaChiDinhRequest
    {
        public int? MaNguoiThucHien { get; set; }
        public string? KetLuan { get; set; }
        public string? UrlKetQua { get; set; }
        public bool HoanThanh { get; set; } = true;
        public List<ChiTietKetQuaItemRequest> ChiTietKetQuas { get; set; } = new();
    }

    public class TiepNhanChiDinhRequest
    {
        public int? MaNguoiThucHien { get; set; }
        public string? GhiChu { get; set; }
    }

    public class HuyChiDinhRequest
    {
        public string LyDo { get; set; } = string.Empty;
    }
}
