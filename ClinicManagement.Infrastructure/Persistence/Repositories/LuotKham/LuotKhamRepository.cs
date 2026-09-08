using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Domain.Common.Enums; 
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public partial class LuotKhamRepository : Repository<LuotKham>, ILuotKhamRepository
    {
        public LuotKhamRepository(ClinicDbContext context) : base(context) { }

        public Task<LuotKham?> GetForCompletionAsync(
            int id, CancellationToken cancellationToken = default)
            => _context.LuotKhams
                .Include(l => l.HoaDons)
                .Include(l => l.DonThuocs)
                    .ThenInclude(d => d.ChiTietDonThuocs)
                .Include(l => l.ChiDinhDichVus)
                    .ThenInclude(c => c.DanhMucDichVu)
                .SingleOrDefaultAsync(l => l.Id == id && !l.IsDeleted, cancellationToken);
        public async Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetPagedAsync(
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
            CancellationToken cancellationToken = default)
        {
            var query = _context.LuotKhams
                .AsNoTracking()

                // Bệnh nhân
                .Include(l => l.BenhNhan)
                    .ThenInclude(bn => bn.BenhNhanCoSo)

                // Bảo hiểm
                .Include(l => l.BenhNhan)
                    .ThenInclude(bn => bn.BaoHiems)

                // Các quan hệ khác
                .Include(l => l.BacSi)
                .Include(l => l.Khoa)
                .Include(l => l.CoSo)
                .Include(l => l.LichHen)
                .Include(l => l.ChanDoans)
                .Include(l => l.PhongKham)

                .Where(l => !l.IsDeleted);

            // =========================
            // LỌC
            // =========================

            if (maBenhNhan.HasValue)
            {
                query = query.Where(
                    l => l.MaBenhNhan == maBenhNhan.Value);
            }

            if (maBacSi.HasValue)
            {
                query = query.Where(
                    l => l.MaBacSi == maBacSi.Value);
            }

            if (maKhoa.HasValue)
            {
                query = query.Where(
                    l => l.MaKhoa == maKhoa.Value);
            }

            if (!string.IsNullOrEmpty(trangThai))
            {
                if (Enum.TryParse<TrangThaiLuotKham>(
                    trangThai,
                    true,
                    out var status))
                {
                    query = query.Where(
                        l => l.TrangThai == status);
                }
            }

            if (fromDate.HasValue)
            {
                query = query.Where(
                    l => l.NgayKham >= fromDate.Value.Date);
            }

            if (toDate.HasValue)
            {
                query = query.Where(
                    l => l.NgayKham <=
                        toDate.Value.Date
                            .AddDays(1)
                            .AddTicks(-1));
            }

            // =========================
            // SẮP XẾP
            // =========================

            if (!string.IsNullOrEmpty(sortBy))
            {
                query = sortBy.ToLower() switch
                {
                    "ngaykham" =>
                        sortDesc
                            ? query.OrderByDescending(l => l.NgayKham)
                            : query.OrderBy(l => l.NgayKham),

                    "mabenhnhan" =>
                        sortDesc
                            ? query.OrderByDescending(l => l.MaBenhNhan)
                            : query.OrderBy(l => l.MaBenhNhan),

                    "mabacsi" =>
                        sortDesc
                            ? query.OrderByDescending(l => l.MaBacSi)
                            : query.OrderBy(l => l.MaBacSi),

                    "makhoa" =>
                        sortDesc
                            ? query.OrderByDescending(l => l.MaKhoa)
                            : query.OrderBy(l => l.MaKhoa),

                    "trangthai" =>
                        sortDesc
                            ? query.OrderByDescending(l => l.TrangThai)
                            : query.OrderBy(l => l.TrangThai),

                    _ =>
                        sortDesc
                            ? query.OrderByDescending(l => l.CreatedAt)
                            : query.OrderBy(l => l.CreatedAt)
                };
            }
            else
            {
                query = sortDesc
                    ? query.OrderByDescending(l => l.NgayKham)
                    : query.OrderBy(l => l.NgayKham);
            }

            // =========================
            // TOTAL
            // =========================

            var totalCount =
                await query.CountAsync(cancellationToken);

            // =========================
            // PAGING
            // =========================

            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }
        


        public async Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetChiDinhDichVuPagedAsync(
            int pageIndex,
            int pageSize,
            int? maKhoa = null,
            int? maBacSi = null,
            int? maBenhNhan = null,
            string? loaiDichVu = null,
            string? trangThai = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.BenhNhanCoSo)
                .Include(l => l.BacSi)
                .Include(l => l.Khoa)
                .Include(l => l.ChiDinhDichVus)
                    .ThenInclude(c => c.DanhMucDichVu)
                .Include(l => l.ChiDinhDichVus)
                    .ThenInclude(c => c.BacSiChiDinh)
                .Where(l => !l.IsDeleted && l.ChiDinhDichVus.Any(c => !c.IsDeleted));

            if (maKhoa.HasValue)
                query = query.Where(l => l.MaKhoa == maKhoa.Value);

            if (maBacSi.HasValue)
                query = query.Where(l => l.ChiDinhDichVus.Any(c => c.MaBacSiChiDinh == maBacSi.Value));

            if (maBenhNhan.HasValue)
                query = query.Where(l => l.MaBenhNhan == maBenhNhan.Value);

            if (!string.IsNullOrEmpty(loaiDichVu) && Enum.TryParse<LoaiDichVu>(loaiDichVu, true, out var loai))
                query = query.Where(l => l.ChiDinhDichVus.Any(c => c.DanhMucDichVu.LoaiDichVu == loai));

            if (!string.IsNullOrEmpty(trangThai) && Enum.TryParse<TrangThaiChiDinhDichVu>(trangThai, true, out var status))
                query = query.Where(l => l.ChiDinhDichVus.Any(c => c.TrangThai == status));

            if (fromDate.HasValue)
                query = query.Where(l => l.ChiDinhDichVus.Any(c => c.NgayChiDinh.Date >= fromDate.Value.Date));

            if (toDate.HasValue)
                query = query.Where(l => l.ChiDinhDichVus.Any(c => c.NgayChiDinh.Date <= toDate.Value.Date));

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }


        public async Task<(IReadOnlyList<DonThuoc> Items, int TotalCount)> GetDonThuocPagedAsync(
            int pageIndex,
            int pageSize,
            int? maKhoa = null,
            int? maBacSi = null,
            int? maBenhNhan = null,
            string? trangThai = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            // Query từ bảng DonThuoc, Include các navigation cần thiết
            var query = _context.DonThuocs
                .AsNoTracking()
                .Include(d => d.LuotKham)
                    .ThenInclude(l => l.BenhNhan)
                        .ThenInclude(b => b.BenhNhanCoSo)
                .Include(d => d.LuotKham)
                    .ThenInclude(l => l.Khoa)
                .Include(d => d.LuotKham)
                    .ThenInclude(l => l.BacSi)
                .Include(d => d.ChiTietDonThuocs)
                    .ThenInclude(ct => ct.Item)
                .Where(d => !d.IsDeleted && !d.LuotKham.IsDeleted);

            // Lọc theo khoa
            if (maKhoa.HasValue)
                query = query.Where(d => d.LuotKham.MaKhoa == maKhoa.Value);

            // Lọc theo bác sĩ kê đơn
            if (maBacSi.HasValue)
                query = query.Where(d => d.MaBacSi == maBacSi.Value);

            // Lọc theo bệnh nhân
            if (maBenhNhan.HasValue)
                query = query.Where(d => d.LuotKham.MaBenhNhan == maBenhNhan.Value);

            // Lọc theo trạng thái đơn thuốc
            if (!string.IsNullOrEmpty(trangThai) && Enum.TryParse<TrangThaiDonThuoc>(trangThai, true, out var status))
                query = query.Where(d => d.TrangThai == status);

            // Lọc theo ngày kê đơn
            if (fromDate.HasValue)
                query = query.Where(d => d.NgayKe.Date >= fromDate.Value.Date);

            if (toDate.HasValue)
                query = query.Where(d => d.NgayKe.Date <= toDate.Value.Date);

            // Đếm tổng
            var totalCount = await query.CountAsync(cancellationToken);

            // Phân trang
            var items = await query
                .OrderByDescending(d => d.NgayKe)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }
            
        //hoá đơn
        // public async Task<(IReadOnlyList<HoaDon> Items, int TotalCount)> GetHoaDonPagedAsync(
        //     int pageIndex,
        //     int pageSize,
        //     int? maKhoa = null,
        //     int? maBenhNhan = null,
        //     string? trangThai = null,
        //     DateTime? fromDate = null,
        //     DateTime? toDate = null,
        //     CancellationToken cancellationToken = default){

        //         var query =  await _context.LuotKhams
        //             .AsNoTracking()
        //             .Include(l => l.BenhNhan)
        //             .Include(l=>l.HoaDon)
        //             .Where(l => !l.IsDeleted)
        //             .SelectMany(l => l.HoaDon.Select(d => new { LuotKham = l, HoaDon = h }))
        //             .Where(x => !x.HoaDon.IsDeleted);
        //         // Lọc theo khoa
        //         if (maKhoa.HasValue)
        //             query = query.Where(x => x.LuotKham.MaKhoa == maKhoa.Value);
        //         if(maBenhNhan.HasValue)
        //             query = query.Where(x=>x.luotKham.MaBenhNhan == maBenhNhan.Value);
        //         // Lọc theo trạng thái đơn thuốc
        //         if (!string.IsNullOrEmpty(trangThai) && Enum.TryParse<TrangThaiHoaDon>(trangThai, true, out var status))
        //             query = query.Where(x => x.HoaDon.TrangThai == status);
        //         // Lọc theo ngày phát hoá đơn
        //         if (fromDate.HasValue)
        //             query = query.Where(x => x.DonThuoc.NgayKe.Date >= fromDate.Value.Date);
        //         if (toDate.HasValue)
        //             query = query.Where(x => x.DonThuoc.NgayKe.Date <= toDate.Value.Date);

        //         // Đếm tổng
        //         var totalCount = await query.CountAsync(cancellationToken);



        //     }
        public async Task<IEnumerable<LuotKham>> GetAllWithIncludesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.Khoa)
                .Include(l => l.BacSi)
                .Include(l => l.BenhNhan)
                .Include(l => l.CoSo)
                .Where(l => !l.IsDeleted)
                .ToListAsync(cancellationToken);
        }
        public async Task<LuotKham?> GetDetailByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.LuotKhams
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.BenhNhanCoSo)
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.TienSuBenhs)
                .Include(l => l.BacSi)
                .Include(l => l.Khoa)
                .Include(l => l.CoSo)
                .Include(l => l.LichHen)
                .Include(l => l.PhongKham)
                .Include(l => l.ChanDoans)
                    .ThenInclude(c => c.ICD)
                .Include(l => l.SinhHieus)
                .Include(l => l.ChiDinhDichVus)
                    .ThenInclude(cd => cd.DanhMucDichVu)
                .Include(l => l.ChiDinhDichVus)
                    .ThenInclude(cd => cd.ChiTietKetQuaXetNghiems)
                .Include(l => l.DonThuocs)
                    .ThenInclude(d => d.ChiTietDonThuocs)
                        .ThenInclude(ct => ct.Item)
                .FirstOrDefaultAsync(l => l.Id == id && !l.IsDeleted, cancellationToken);
        }
        
        public async Task<LuotKham?> GetTienSinhHieuLuotKhamByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.TienSuBenhs)
                .Include(l => l.SinhHieus)
                .Where(l => l.Id == id && !l.IsDeleted)
                .FirstOrDefaultAsync(cancellationToken);
        }


        public async Task<IReadOnlyList<ICD>> SearchICDAsync(string? keyword, CancellationToken cancellationToken = default)
        {
            var query = _context.ICDs.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalizedKeyword = keyword.Trim();
                query = query.Where(x => x.MaICD.Contains(normalizedKeyword) || x.TenICD.Contains(normalizedKeyword));
            }

            return await query
                .OrderBy(x => x.MaICD)
                .Take(50)
                .ToListAsync(cancellationToken);
        }

        public async Task<LuotKham?> GetChiTietHoSoDieuTriAsync(int luotKhamId, CancellationToken cancellationToken = default)
        {
            return await _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.BenhNhanCoSo)
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.BaoHiems)
                .Include(l => l.Khoa)
                .Include(l => l.PhongKham)
                .FirstOrDefaultAsync(l => l.Id == luotKhamId && !l.IsDeleted, cancellationToken);
        }

        public async Task<LuotKham?> GetThongTinBenhNhanTrongLuotKhamAsync(int luotKhamId, CancellationToken cancellationToken = default)
        {
            return await _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.BenhNhanCoSo)
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.BaoHiems)
                .Include(l => l.Khoa)
                .Include(l => l.PhongKham)
                .FirstOrDefaultAsync(l => l.Id == luotKhamId && !l.IsDeleted, cancellationToken);
        }
        
        public async Task<int> GetMaxSoThuTuAsync(DateTime ngayKham, int maKhoa, CancellationToken cancellationToken = default)
        {
            var max = await _context.LuotKhams
                .Where(l => l.NgayKham.Date == ngayKham.Date && l.MaKhoa == maKhoa && !l.IsDeleted)
                .MaxAsync(l => (int?)l.SoThuTu, cancellationToken);

            return max ?? 0;
        }
   
        public async Task<IEnumerable<LuotKham>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.Khoa)
                .Include(l => l.BacSi)
                .Include(l => l.BenhNhan)
                .Include(l => l.CoSo)
                .Include(l => l.PhongKham)
                .Where(l => !l.IsDeleted)
                .ToListAsync(cancellationToken);
        }
        public IQueryable<LuotKham> GetThongTrangThaiLuotKham(int? maCoSo = null, int? maKhoa = null)
        {
            var query = _context.LuotKhams
                .AsNoTracking()
                .Where(l => !l.IsDeleted);

            if (maCoSo.HasValue)
                query = query.Where(l => l.MaCoSo == maCoSo.Value);

            if (maKhoa.HasValue)
                query = query.Where(l => l.MaKhoa == maKhoa.Value);

            return query;
        }
        public IQueryable<LuotKham> GetThongKeChiDinhDvLuotKham(int? maCoSo = null, int? maKhoa = null)
        {
            var query = _context.LuotKhams
                .AsNoTracking()
                .Include(lk => lk.ChiDinhDichVus)
                .Where(lk => !lk.IsDeleted);
            if (maCoSo.HasValue)
            {
                query = query.Where(lk => lk.MaCoSo == maCoSo.Value);
            }
            if (maKhoa.HasValue)
            {
                query = query.Where(lk => lk.MaKhoa == maKhoa.Value);
            }
            return query;
        }

        
        public IQueryable<LuotKham> GetThongKeDonThuocLuotKham(int? maCoSo = null, int? maKhoa = null)
        {
            var query = _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.DonThuocs)
                .Where(lk => !lk.IsDeleted);

            if (maCoSo.HasValue)
            {
                query = query.Where(lk => lk.MaCoSo == maCoSo.Value);
            }
            if (maKhoa.HasValue)
            {
                query = query.Where(lk => lk.MaKhoa == maKhoa.Value);
            }
            return query;
        }
        // lấy hàng đợi cho nhân viên
        public async Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetHangDoiExtendedAsync(
            int maBacSi,
            int pageIndex = 1,
            int pageSize = 1000,
            CancellationToken cancellationToken = default)
        {
            if (pageIndex < 1) pageIndex = 1;
            if (pageSize < 1) pageSize = 1000;
            if (pageSize > 2000) pageSize = 2000;

            var query = _context.LuotKhams
                .AsNoTracking()
                .Include(l => l.BenhNhan)
                    .ThenInclude(b => b.BenhNhanCoSo)
                .Include(l => l.Khoa)
                .Where(l => !l.IsDeleted
                    && l.MaBacSi == maBacSi
                    && (l.TrangThai == TrangThaiLuotKham.CHO_KHAM || l.TrangThai == TrangThaiLuotKham.DANG_KHAM))
                .OrderBy(l => l.SoThuTu ?? int.MaxValue)
                .ThenBy(l => l.NgayKham);

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

    } 
}