namespace ClinicManagement.Application.DTOs.Kho.XuatNoiBo;

/// <summary>Một dòng vật tư trong yêu cầu xuất nội bộ theo Khoa/Phòng.</summary>
public sealed record YeuCauXuatNoiBoItem(
    int ItemId,
    decimal SoLuong,
    string? DonViTinh,
    string? GhiChu);

/// <summary>Payload tạo phiếu yêu cầu xuất nội bộ theo Khoa/Phòng.</summary>
public sealed record TaoYeuCauXuatNoiBoRequest(
    int MaKhoXuat,
    int MaKhoaNhan,
    int? NguoiNhanId,
    string? GhiChu,
    string IdempotencyKey,
    IEnumerable<YeuCauXuatNoiBoItem> Items);

/// <summary>Params lọc danh sách phiếu xuất nội bộ Khoa/Phòng.</summary>
public sealed record GetPhieuXuatNoiBoParams(
    int? MaKhoa,
    string? TrangThai,
    DateTime? TuNgay,
    DateTime? DenNgay,
    int PageIndex = 1,
    int PageSize = 20);

/// <summary>Params thống kê tiêu hao theo khoa trong kỳ.</summary>
public sealed record GetThongKeTieuHaoParams(
    int? MaKhoa,
    DateTime TuNgay,
    DateTime DenNgay);

/// <summary>Payload xác nhận đã nhận hàng nội bộ.</summary>
public sealed record XacNhanNhanHangNoiBoRequest(
    int? NguoiNhanId = null,
    string? GhiChuNhanHang = null);

