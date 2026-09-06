namespace ClinicManagement.Application.DTOs.NhanVien
{
    public class RoleDto
    {
        public int Id { get; set; }
        public string TenVaiTro { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
    }

    public class PermissionDto
    {
        public int Id { get; set; }
        public string TenQuyen { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
    }

    public class UpdateEmployeeRolesRequest
    {
        public List<int> RoleIds { get; set; } = [];
        public DateTime NgayBatDau { get; set; } = DateTime.UtcNow.Date;
        public DateTime? NgayKetThuc { get; set; }
    }
}
