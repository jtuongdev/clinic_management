using ClinicManagement.Domain.Examination;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Domain.Repositories
{
    public partial interface ILuotKhamRepository : IRepository<LuotKham>
    {
        Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetPagedAsync(
            int pageIndex,
            int pageSize,
            int? maBenhNhan = null,
            int? maBacSi = null,
            int? maKhoa = null,
            string? trangThai = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            string? sortBy = null,
            bool sortDesc = true,
            CancellationToken cancellationToken = default);
        Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetChiDinhDichVuPagedAsync(
            int pageIndex,
            int pageSize,
            int? maKhoa = null,
            int? maBacSi = null,
            int? maBenhNhan = null,
            string? loaiDichVu = null,
            string? trangThai = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default);

        Task<(IReadOnlyList<DonThuoc> Items, int TotalCount)> GetDonThuocPagedAsync(
            int pageIndex,
            int pageSize,
            int? maKhoa = null,
            int? maBacSi = null,
            int? maBenhNhan = null,
            string? trangThai = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default);

        // Task<IEnumerable<LuotKham>> GetHangDoi(int maBacSi,CancellationToken cancellationToken = default);
        // Task<(IReadOnlyList<HoaDon> Items, int TotalCount)> GetHoaDonPagedAsync(
        //     int pageIndex,
        //     int pageSize,
        //     int? maKhoa = null,
        //     string? TrangThai = null,
        //     DateTime? fromDate = null,
        //     DateTime? toDate = null,
        //     CancellationToken cancellationToken = default);
        Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetHangDoiByBacSiAsync(
            int maBacSi,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<LuotKham>> GetAllWithIncludesAsync(CancellationToken cancellationToken = default);
        Task<LuotKham?> GetDetailByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<LuotKham?> GetTienSinhHieuLuotKhamByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ICD>> SearchICDAsync(string? keyword, CancellationToken cancellationToken = default);
        Task<LuotKham?> GetChiTietHoSoDieuTriAsync(int luotKhamId, CancellationToken cancellationToken = default);
        Task<LuotKham?> GetThongTinBenhNhanTrongLuotKhamAsync(int luotKhamId, CancellationToken cancellationToken = default);
        Task<int> GetMaxSoThuTuAsync(DateTime ngayKham, int maKhoa, CancellationToken cancellationToken = default);
        //luotkham
        IQueryable<LuotKham> GetThongTrangThaiLuotKham(int? maCoSo = null, int? maKhoa = null);

        // chỉ định dịch vụ 
        IQueryable<LuotKham> GetThongKeChiDinhDvLuotKham(int? maCoSo = null, int? maKhoa = null);
        //donthuot
        IQueryable<LuotKham> GetThongKeDonThuocLuotKham(int? maCoSo = null, int? maKhoa = null);

        // IQueryable<LuotKham> GetThongKeHoaDonLuotKham(int? maCoSo = null, int? maKhoa = null, DateTime? fromDate = null,DateTime? toDate = null,CancellationToken cancellationToken = default);

    
        //hàng đợi cho nhân viên 
        Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetHangDoiExtendedAsync(
            int maBacSi,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default);
    
    
        // Chuan doan luokham
        Task<IEnumerable<LuotKham>> GetDiagnosePatientInExamination(int id, CancellationToken cancellationToken = default);
    }
}