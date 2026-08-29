using ClinicManagement.Domain.Identity;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClinicManagement.Domain.Repositories
{
    public interface INhanVienRepository : IRepository<NhanVien>
    {
        Task<NhanVien?> GetByUsernameAsync(string username);
        
        Task<NhanVien?> GetByEmailAsync(string email);
        
        Task<bool> IsUsernameExistAsync(string username);
        
        Task<IReadOnlyList<NhanVien>> GetActiveDoctorsAsync();
        Task<List<VaiTro>> GetRolesByUserIdAsync(int userId);

        Task<List<Quyen>> GetPermissionsByUserIdAsync(int userId);

        Task<List<NhanVien>> GetBacSiByKhoaAsync(
            int maKhoa,
            int maCoSo,
            CancellationToken cancellationToken = default);
        

    }
}
