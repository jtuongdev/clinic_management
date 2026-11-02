using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory
{
    public class ChiTietXuatKho : BaseEntity
    {
        public int MaPhieuXuat { get; set; }
        public int MaChiTietNhap { get; set; }
        public decimal SoLuongXuat { get; set; }
        public decimal DonGiaXuat { get; set; }
        public int? CreatedBy { get; set; }

        /// <summary>
        /// Mặt hàng yêu cầu xuất (dùng cho phiếu ở trạng thái ChoDuyet trước khi FEFO gán lô).
        /// Khi phiếu được duyệt, MaChiTietNhap sẽ được điền và trường này vẫn giữ để tra cứu.
        /// </summary>
        public int? MaItemYeuCau { get; set; }

        public virtual PhieuXuatKho PhieuXuatKho { get; set; } = null!;
        public virtual ChiTietNhapKho ChiTietNhapKho { get; set; } = null!;
        public virtual Item? ItemYeuCau { get; set; }
    }
}
