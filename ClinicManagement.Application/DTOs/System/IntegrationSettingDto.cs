namespace ClinicManagement.Application.DTOs.System
{
    public sealed record IntegrationSettingDto(
        int Id,
        string DanhMuc,
        string MaCode,
        string Ten,
        string GiaTri,
        string? MoTa,
        bool DaMaHoa,
        int? NguoiCapNhat,
        DateTime ThoiGianCapNhat);

    public sealed record UpsertIntegrationSettingRequest(
        string DanhMuc,
        string MaCode,
        string Ten,
        string GiaTri,
        string? MoTa,
        bool DaMaHoa = false,
        int? NguoiCapNhat = null);
}
