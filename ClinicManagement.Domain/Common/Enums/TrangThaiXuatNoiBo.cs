namespace ClinicManagement.Domain.Common.Enums;

/// <summary>
/// Trạng thái vòng đời của phiếu xuất cấp phát nội bộ theo Khoa/Phòng.
/// </summary>
public enum TrangThaiXuatNoiBo
{
    /// <summary>Khoa/Phòng vừa tạo yêu cầu — chờ Admin kho duyệt.</summary>
    ChoDuyet = 0,

    /// <summary>Admin duyệt và đã trừ tồn kho tổng theo FEFO.</summary>
    DaDuyet = 1,

    /// <summary>Trưởng khoa / Điều dưỡng trưởng đã ký xác nhận nhận đủ hàng.</summary>
    DaNhanHang = 2,

    /// <summary>Admin từ chối yêu cầu — phiếu bị hủy bỏ.</summary>
    TuChoi = 3
}
