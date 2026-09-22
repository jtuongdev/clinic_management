namespace ClinicManagement.Application.DTOs.System
{
    public sealed record EmrAuditLogDto(
        int Id,
        int MaBenhNhan,
        int MaHoSo,
        int MaNguoiDung,
        string HanhDong,
        string PhanHe,
        string DiaChiIp,
        DateTime ThoiGian,
        string ChiTiet,
        string TrangThai);

    public sealed record CreateEmrAuditLogRequest(
        int MaBenhNhan,
        int MaHoSo,
        int MaNguoiDung,
        string HanhDong,
        string PhanHe,
        string DiaChiIp,
        string ChiTiet,
        string TrangThai = "THANH_CONG");
}
