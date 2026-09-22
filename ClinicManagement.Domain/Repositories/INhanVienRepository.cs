using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClinicManagement.Domain.Repositories
{
    public interface INhanVienRepository : IRepository<NhanVien>
    {
        Task<NhanVien?> GetByUsernameAsync(string username);
        
        Task<NhanVien?> GetByEmailAsync(string email);
        
        Task<bool> IsUsernameExistAsync(string username);
        Task<bool> IsEmailExistAsync(string email, int? excludeId = null);
        Task<bool> IsSoHanhNgheExistAsync(string soHanhNghe, int? excludeId = null);
        Task<NhanVien?> GetDetailByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<NhanVien>> GetPagedAsync(
            string? keyword,
            int? maChucVu,
            bool? isActive,
            int? maKhoa,
            DateTime? ngay,
            int pageIndex,
            int pageSize,
            CancellationToken cancellationToken = default);
        Task<int> CountPagedAsync(
            string? keyword,
            int? maChucVu,
            bool? isActive,
            int? maKhoa,
            DateTime? ngay,
            CancellationToken cancellationToken = default);
        
        Task<IReadOnlyList<NhanVien>> GetActiveDoctorsAsync();
        Task<List<VaiTro>> GetRolesByUserIdAsync(int userId);
        Task<List<VaiTro>> GetAllRolesAsync(CancellationToken cancellationToken = default);
        Task<List<VaiTro>> GetRolesByIdsAsync(IEnumerable<int> roleIds, CancellationToken cancellationToken = default);
        Task<NhanVien?> GetDetailForUpdateAsync(int id, CancellationToken cancellationToken = default);

        Task<List<MaTranPhanQuyen>> GetPermissionsByUserIdAsync(int userId);

        Task<List<ChucVu>> GetAllChucVusAsync(CancellationToken cancellationToken = default);
        Task<List<BacSiKhoaModel>> GetBacSiByKhoaAsync(
            int maKhoa,
            int maCoSo,
            CancellationToken cancellationToken = default);
        

    }
}
