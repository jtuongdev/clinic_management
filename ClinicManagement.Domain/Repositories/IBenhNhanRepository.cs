using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using ClinicManagement.Domain.Patient;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Domain.Service;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Domain.Repositories
{
    public interface IBenhNhanRepository : IRepository<BenhNhan>
    {
        Task<BenhNhan?> GetByCCCDAsync(string cccd);
        Task<BenhNhan?> GetByPhoneAsync(string phone);
        Task<BenhNhan?> GetByEmailAsync(string email);
        Task<BenhNhan?> GetByUsernameAsync(string username);
        Task<BenhNhan?> GetByMaNoiBoAsync(int maCoSo, string maBenhNhanNoiBo);
        Task<IReadOnlyList<BenhNhan>> SearchAsync(string keyword);
        Task<bool> IsCCCDExistAsync(string cccd);
        Task<string> GenerateMaBenhNhanNoiBoAsync(int maCoSo);
        Task<IReadOnlyList<BenhNhan>> GetByDateRangeAsync(DateTime? fromDate = null, DateTime? toDate = null);
        Task<IReadOnlyList<BenhNhan>> GetDeletedAsync();
        Task<IReadOnlyList<TienSuBenh>> GetTienSuByBenhNhanIdAsync(int benhNhanId);
        Task<TienSuBenh?> GetLatestTienSuAsync(int benhNhanId);
        Task<IReadOnlyList<BenhNhan>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            IQueryable<BenhNhan> query,
            Func<IQueryable<BenhNhan>, IOrderedQueryable<BenhNhan>>? orderBy = null);
        Task<int> CountAsync(IQueryable<BenhNhan> query);
        Task<int> CountBenhNhanAsync();
        Task<int> CountDangKhamAsync();
        Task<int> CountChoKhamAsync();
        Task<int> CountHoanThanhAsync();
        Task<int> CountHuyAsync();
        Task<BenhNhan?> GetPatientProfileAsync(int id, CancellationToken cancellationToken = default);
        Task<int> GetMaxSoThuTuAsync(int maCoSo, DateTime ngayKham, CancellationToken cancellationToken = default);

        // TAB: LỊCH SỬ KHÁM
        Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetVisitsByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            string? status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default);

        // TAB: ĐƠN THUỐC
        Task<(IReadOnlyList<DonThuoc> Items, int TotalCount)> GetPrescriptionsByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default);

        // TAB: XÉT NGHIỆM
        Task<(IReadOnlyList<ChiDinhDichVu> Items, int TotalCount)> GetLabResultsByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default);

        // TAB: HÓA ĐƠN
        Task<(IReadOnlyList<HoaDon> Items, int TotalCount)> GetInvoicesByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            string? status = null,
            CancellationToken cancellationToken = default);

        // Phương thức cho danh sách bệnh nhân (có lượt khám gần nhất)
        Task<(IReadOnlyList<(BenhNhan BenhNhan, LuotKham LuotKhamGanNhat)> Items, int TotalCount)> GetBenhNhanPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            string? trangThai = null,
            int? maKhoa = null,
            int? maCoSo = null,
            CancellationToken cancellationToken = default);
    }
}