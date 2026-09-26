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
                .Include(l => l.ChanDoans)
                .Include(l => l.DonThuocs)
                    .ThenInclude(d => d.ChiTietDonThuocs)
                        .ThenInclude(ct => ct.Item)
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
            if (!await _context.ICDs.AnyAsync(cancellationToken))
            {
                var defaultIcds = GetDefaultICDList();
                await _context.ICDs.AddRangeAsync(defaultIcds, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }

            var query = _context.ICDs.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalizedKeyword = keyword.Trim();
                query = query.Where(x => x.MaICD.Contains(normalizedKeyword) || x.TenICD.Contains(normalizedKeyword));
            }

            return await query
                .OrderBy(x => x.MaICD)
                .Take(500)
                .ToListAsync(cancellationToken);
        }

        private static List<ICD> GetDefaultICDList()
        {
            return new List<ICD>
            {
                new ICD { MaICD = "A09", TenICD = "Tiêu chảy và viêm dạ dày-ruột có nguồn gốc nhiễm khuẩn", Chuong = "Chương I: Bệnh nhiễm trùng và ký sinh trùng" },
                new ICD { MaICD = "B01", TenICD = "Bệnh thủy đậu [Varicella]", Chuong = "Chương I: Bệnh nhiễm trùng và ký sinh trùng" },
                new ICD { MaICD = "B15", TenICD = "Viêm gan virus A cấp tính", Chuong = "Chương I: Bệnh nhiễm trùng và ký sinh trùng" },
                new ICD { MaICD = "B16", TenICD = "Viêm gan virus B cấp tính", Chuong = "Chương I: Bệnh nhiễm trùng và ký sinh trùng" },
                new ICD { MaICD = "B18.1", TenICD = "Viêm gan virus B mạn tính", Chuong = "Chương I: Bệnh nhiễm trùng và ký sinh trùng" },
                new ICD { MaICD = "B18.2", TenICD = "Viêm gan virus C mạn tính", Chuong = "Chương I: Bệnh nhiễm trùng và ký sinh trùng" },
                new ICD { MaICD = "E11", TenICD = "Đái tháo đường không phụ thuộc insulin (Type 2)", Chuong = "Chương IV: Bệnh nội tiết, dinh dưỡng và chuyển hóa" },
                new ICD { MaICD = "E10", TenICD = "Đái tháo đường phụ thuộc insulin (Type 1)", Chuong = "Chương IV: Bệnh nội tiết, dinh dưỡng và chuyển hóa" },
                new ICD { MaICD = "E05", TenICD = "Nhiễm độc giáp [Cường giáp]", Chuong = "Chương IV: Bệnh nội tiết, dinh dưỡng và chuyển hóa" },
                new ICD { MaICD = "E03", TenICD = "Suy giáp khác", Chuong = "Chương IV: Bệnh nội tiết, dinh dưỡng và chuyển hóa" },
                new ICD { MaICD = "E78", TenICD = "Rối loạn chuyển hóa lipoprotein và tăng lipid máu", Chuong = "Chương IV: Bệnh nội tiết, dinh dưỡng và chuyển hóa" },
                new ICD { MaICD = "E66", TenICD = "Béo phì", Chuong = "Chương IV: Bệnh nội tiết, dinh dưỡng và chuyển hóa" },
                new ICD { MaICD = "I10", TenICD = "Bệnh tăng huyết áp vô căn (nguyên phát)", Chuong = "Chương IX: Bệnh hệ tuần hoàn" },
                new ICD { MaICD = "I11", TenICD = "Bệnh tim do tăng huyết áp", Chuong = "Chương IX: Bệnh hệ tuần hoàn" },
                new ICD { MaICD = "I20", TenICD = "Cơn đau thắt ngực", Chuong = "Chương IX: Bệnh hệ tuần hoàn" },
                new ICD { MaICD = "I21", TenICD = "Nhồi máu cơ tim cấp", Chuong = "Chương IX: Bệnh hệ tuần hoàn" },
                new ICD { MaICD = "I25", TenICD = "Bệnh tim thiếu máu cục bộ mạn tính", Chuong = "Chương IX: Bệnh hệ tuần hoàn" },
                new ICD { MaICD = "I50", TenICD = "Suy tim", Chuong = "Chương IX: Bệnh hệ tuần hoàn" },
                new ICD { MaICD = "I63", TenICD = "Nhồi máu não", Chuong = "Chương IX: Bệnh hệ tuần hoàn" },
                new ICD { MaICD = "J00", TenICD = "Viêm mũi họng cấp tính [Cảm thường]", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "J02", TenICD = "Viêm họng cấp", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "J03", TenICD = "Viêm amiđan cấp", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "J06", TenICD = "Nhiễm khuẩn đường hô hấp trên cấp tính", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "J18", TenICD = "Viêm phổi, không xác định vi sinh vật", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "J20", TenICD = "Viêm phế quản cấp", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "J44", TenICD = "Bệnh phổi tắc nghẽn mạn tính [COPD]", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "J45", TenICD = "Hen phế quản", Chuong = "Chương X: Bệnh hệ hô hấp" },
                new ICD { MaICD = "K21", TenICD = "Bệnh trào ngược dạ dày - thực quản [GERD]", Chuong = "Chương XI: Bệnh hệ tiêu hóa" },
                new ICD { MaICD = "K25", TenICD = "Loét dạ dày", Chuong = "Chương XI: Bệnh hệ tiêu hóa" },
                new ICD { MaICD = "K26", TenICD = "Loét tá tràng", Chuong = "Chương XI: Bệnh hệ tiêu hóa" },
                new ICD { MaICD = "K29", TenICD = "Viêm dạ dày và tá tràng", Chuong = "Chương XI: Bệnh hệ tiêu hóa" },
                new ICD { MaICD = "K58", TenICD = "Hội chứng ruột kích thích [IBS]", Chuong = "Chương XI: Bệnh hệ tiêu hóa" },
                new ICD { MaICD = "K76", TenICD = "Bệnh gan khác (Gan nhiễm mỡ)", Chuong = "Chương XI: Bệnh hệ tiêu hóa" },
                new ICD { MaICD = "M10", TenICD = "Bệnh gút [Gout]", Chuong = "Chương XIII: Bệnh hệ cơ-xương-khớp và mô liên kết" },
                new ICD { MaICD = "M15", TenICD = "Thoái hóa đa khớp", Chuong = "Chương XIII: Bệnh hệ cơ-xương-khớp và mô liên kết" },
                new ICD { MaICD = "M17", TenICD = "Thoái hóa khớp gối", Chuong = "Chương XIII: Bệnh hệ cơ-xương-khớp và mô liên kết" },
                new ICD { MaICD = "M54.5", TenICD = "Đau lưng dưới", Chuong = "Chương XIII: Bệnh hệ cơ-xương-khớp và mô liên kết" },
                new ICD { MaICD = "M50", TenICD = "Thoái hóa đĩa đệm cột sống cổ", Chuong = "Chương XIII: Bệnh hệ cơ-xương-khớp và mô liên kết" },
                new ICD { MaICD = "N18", TenICD = "Bệnh thận mạn tính", Chuong = "Chương XIV: Bệnh hệ sinh dục - tiết niệu" },
                new ICD { MaICD = "N20", TenICD = "Sỏi thận và sỏi niệu quản", Chuong = "Chương XIV: Bệnh hệ sinh dục - tiết niệu" },
                new ICD { MaICD = "N39.0", TenICD = "Nhiễm khuẩn đường tiết niệu", Chuong = "Chương XIV: Bệnh hệ sinh dục - tiết niệu" },
                new ICD { MaICD = "R05", TenICD = "Ho", Chuong = "Chương XVIII: Triệu chứng và dấu hiệu lâm sàng" },
                new ICD { MaICD = "R07", TenICD = "Đau họng và đau ngực", Chuong = "Chương XVIII: Triệu chứng và dấu hiệu lâm sàng" },
                new ICD { MaICD = "R10", TenICD = "Đau bụng và vùng chậu", Chuong = "Chương XVIII: Triệu chứng và dấu hiệu lâm sàng" },
                new ICD { MaICD = "R50", TenICD = "Sốt không rõ nguyên nhân khác", Chuong = "Chương XVIII: Triệu chứng và dấu hiệu lâm sàng" },
                new ICD { MaICD = "R51", TenICD = "Đau đầu", Chuong = "Chương XVIII: Triệu chứng và dấu hiệu lâm sàng" }
            };
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

        public async Task<ClinicManagement.Domain.Service.ChiDinhDichVu?> GetChiDinhDichVuByIdAsync(int chiDinhId, CancellationToken cancellationToken = default)
        {
            return await _context.ChiDinhDichVus
                .Include(cd => cd.LuotKham)
                    .ThenInclude(lk => lk.BenhNhan)
                        .ThenInclude(bn => bn.BenhNhanCoSo)
                .Include(cd => cd.LuotKham)
                    .ThenInclude(lk => lk.Khoa)
                .Include(cd => cd.LuotKham)
                    .ThenInclude(lk => lk.ChanDoans)
                        .ThenInclude(cd => cd.ICD)
                .Include(cd => cd.DanhMucDichVu)
                .Include(cd => cd.BacSiChiDinh)
                .Include(cd => cd.NguoiThucHien)
                .Include(cd => cd.ChiTietKetQuaXetNghiems)
                .FirstOrDefaultAsync(cd => cd.Id == chiDinhId && !cd.IsDeleted, cancellationToken);
        }
    } 
}