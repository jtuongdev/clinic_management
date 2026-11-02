namespace ClinicManagement.Domain.Common.Enums;

public enum LoaiGiaoDichKho
{
    NHAP = 1,
    XUAT_DON = 2,
    XUAT_BAN_LE = 3,
    XUAT_THU_THUAT = 4,
    DIEU_CHINH = 5,
    HUY = 6,
    /// <summary>Trả hàng cho nhà cung cấp (bao bì lỗi, hàng sai...).</summary>
    TRA_NCC = 7,
    /// <summary>Bệnh nhân hoàn trả thuốc còn nguyên niêm phong, xác định được lô.</summary>
    NHAP_TRA_BENH_NHAN = 8,
    /// <summary>Xuất cấp phát vật tư tiêu hao cho tủ trực Khoa/Phòng (có quy trình duyệt).</summary>
    XUAT_CAP_PHAT_KHOA_PHONG = 9
}
