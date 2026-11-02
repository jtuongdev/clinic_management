using ClinicManagement.Domain.Facility;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ClinicManagement.Domain.Repositories
{
    public interface IPhongKhamRepository : IRepository<PhongKham>
    {
        /// <summary>
        /// Lấy danh sách phòng khám theo khoa
        /// </summary>
        Task<IEnumerable<PhongKham>> GetByKhoaAsync(int maKhoa);

        /// <summary>
        /// Lấy danh sách phòng khám theo nhân viên (bác sĩ)
        /// </summary>
        Task<IEnumerable<PhongKham>> GetByNhanVienAsync(int maNhanVien);
    

        /// <summary>
        /// Lấy danh sách phòng khám theo cơ sở
        /// </summary>
        Task<IEnumerable<PhongKham>> GetByCoSoAsync(int maCoSo);

        /// <summary>
        /// Lấy danh sách phòng khám đang hoạt động
        /// </summary>
        Task<IEnumerable<PhongKham>> GetActiveAsync(int? maKhoa = null);
    }
}