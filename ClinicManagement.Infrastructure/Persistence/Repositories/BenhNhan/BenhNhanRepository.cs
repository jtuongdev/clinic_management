// Infrastructure/Persistence/Repositories/BenhNhanRepository.cs
using ClinicManagement.Domain.Patient;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Infrastructure.Persistence;
using ClinicManagement.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Domain.Service;
using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public partial class BenhNhanRepository : Repository<BenhNhan>, IBenhNhanRepository
    {
        public BenhNhanRepository(ClinicDbContext context) : base(context)
        {
        }

        /// <summary>
        /// Lấy thông tin bệnh nhân theo số CCCD.
        /// </summary>
        /// <param name="cccd">Số CCCD cần tìm (chuỗi).</param>
        /// <returns>Đối tượng BenhNhan nếu tìm thấy, ngược lại null.</returns>
        public async Task<BenhNhan?> GetByCCCDAsync(string cccd)
        {
            return await _context.BenhNhans
                .FirstOrDefaultAsync(b => b.SoCCCD == cccd && !b.IsDeleted);
        }

        /// <summary>
        /// Lấy thông tin bệnh nhân theo số điện thoại.
        /// </summary>
        /// <param name="phone">Số điện thoại (chuỗi).</param>
        /// <returns>Đối tượng BenhNhan nếu tìm thấy, ngược lại null.</returns>
        public async Task<BenhNhan?> GetByPhoneAsync(string phone)
        {
            return await _context.BenhNhans
                .FirstOrDefaultAsync(b => b.DienThoai == phone && !b.IsDeleted);
        }

        /// <summary>
        /// Lấy thông tin bệnh nhân theo địa chỉ email.
        /// </summary>
        /// <param name="email">Địa chỉ email (chuỗi).</param>
        /// <returns>Đối tượng BenhNhan nếu tìm thấy, ngược lại null.</returns>
        public async Task<BenhNhan?> GetByEmailAsync(string email)
        {
            return await _context.BenhNhans
                .FirstOrDefaultAsync(b => b.Email == email && !b.IsDeleted);
        }

        /// <summary>
        /// Lấy thông tin bệnh nhân theo tên đăng nhập (Username).
        /// </summary>
        /// <param name="username">Tên đăng nhập (chuỗi).</param>
        /// <returns>Đối tượng BenhNhan nếu tìm thấy, ngược lại null.</returns>
        public async Task<BenhNhan?> GetByUsernameAsync(string username)
        {
            return await _context.BenhNhans
                .FirstOrDefaultAsync(b => b.Username == username && !b.IsDeleted);
        }

        /// <summary>
        /// Lấy thông tin bệnh nhân theo mã nội bộ tại một cơ sở cụ thể.
        /// </summary>
        /// <param name="maCoSo">Mã cơ sở (int).</param>
        /// <param name="maBenhNhanNoiBo">Mã bệnh nhân nội bộ (chuỗi).</param>
        /// <returns>Đối tượng BenhNhan nếu tìm thấy, ngược lại null.</returns>
        public async Task<BenhNhan?> GetByMaNoiBoAsync(int maCoSo, string maBenhNhanNoiBo)
        {
            return await _context.BenhNhans
                .Include(b => b.BenhNhanCoSo)
                .FirstOrDefaultAsync(b => b.BenhNhanCoSo.Any(bn => bn.MaCoSo == maCoSo && bn.MaBenhNhanNoiBo == maBenhNhanNoiBo && !bn.IsDeleted) && !b.IsDeleted);
        }

        /// <summary>
        /// Tìm kiếm bệnh nhân theo từ khóa (áp dụng trên Họ, Tên, CCCD, mã nội bộ).
        /// </summary>
        /// <param name="keyword">Từ khóa tìm kiếm (chuỗi).</param>
        /// <returns>Danh sách bệnh nhân thỏa mãn điều kiện (IReadOnlyList).</returns>
        public async Task<IReadOnlyList<BenhNhan>> SearchAsync(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return await _context.BenhNhans
                    .AsNoTracking()
                    .Where(b => !b.IsDeleted)
                    .ToListAsync();

            keyword = keyword.Trim().ToLower();

            return await _context.BenhNhans
                .AsNoTracking()
                .Where(b => !b.IsDeleted && (
                    b.Ho.ToLower().Contains(keyword) ||
                    b.Ten.ToLower().Contains(keyword) ||
                    b.SoCCCD.Contains(keyword) ||
                    b.BenhNhanCoSo.Any(bn => bn.MaBenhNhanNoiBo.ToLower().Contains(keyword))
                ))
                .ToListAsync();
        }

        /// <summary>
        /// Kiểm tra xem một số CCCD đã tồn tại trong hệ thống (chưa bị xóa mềm) hay chưa.
        /// </summary>
        /// <param name="cccd">Số CCCD cần kiểm tra.</param>
        /// <returns>True nếu tồn tại, ngược lại False.</returns>
        public async Task<bool> IsCCCDExistAsync(string cccd)
        {
            return await _context.BenhNhans
                .AnyAsync(b => b.SoCCCD == cccd && !b.IsDeleted);
        }

        /// <summary>
        /// Tự động sinh mã bệnh nhân nội bộ mới cho một cơ sở (theo định dạng BN-{maCoSo:D3}-{nextId:D5}).
        /// </summary>
        /// <param name="maCoSo">Mã cơ sở (int).</param>
        /// <returns>Chuỗi mã mới được tạo.</returns>
        public async Task<string> GenerateMaBenhNhanNoiBoAsync(int maCoSo)
        {
            var lastPatient = await _context.BenhNhanCoSos
                .AsNoTracking()
                .Where(bn => bn.MaCoSo == maCoSo && bn.MaBenhNhanNoiBo.StartsWith($"BN-{maCoSo:D3}-") && !bn.IsDeleted)
                .OrderByDescending(bn => bn.MaBenhNhanNoiBo)
                .FirstOrDefaultAsync();

            int nextId = 1;

            if (lastPatient != null && !string.IsNullOrEmpty(lastPatient.MaBenhNhanNoiBo))
            {
                var parts = lastPatient.MaBenhNhanNoiBo.Split('-');
                if (parts.Length == 3 && int.TryParse(parts[2], out int lastId))
                {
                    nextId = lastId + 1;
                }
            }

            return $"BN-{maCoSo:D3}-{nextId:D5}";
        }

        /// <summary>
        /// Lấy số thứ tự lớn nhất của lượt khám trong một cơ sở vào một ngày cụ thể.
        /// Dùng để tạo số thứ tự mới.
        /// </summary>
        /// <param name="maCoSo">Mã cơ sở.</param>
        /// <param name="ngayKham">Ngày khám (DateTime).</param>
        /// <param name="cancellationToken">Token hủy bỏ.</param>
        /// <returns>Số thứ tự lớn nhất tìm thấy; nếu không có thì trả về 0.</returns>
        public async Task<int> GetMaxSoThuTuAsync(int maCoSo, DateTime ngayKham, CancellationToken cancellationToken = default)
        {
            var max = await _context.LuotKhams
                .Where(l => l.MaCoSo == maCoSo && l.NgayKham.Date == ngayKham.Date && !l.IsDeleted)
                .MaxAsync(l => (int?)l.SoThuTu, cancellationToken);

            return max ?? 0;
        }

        /// <summary>
        /// Lấy danh sách bệnh nhân được tạo trong khoảng thời gian (dựa trên CreatedAt).
        /// </summary>
        /// <param name="fromDate">Ngày bắt đầu (có thể null, mặc định hôm nay).</param>
        /// <param name="toDate">Ngày kết thúc (có thể null, mặc định hôm nay).</param>
        /// <returns>Danh sách bệnh nhân (IReadOnlyList) đã được Include các thông tin liên quan.</returns>
        public async Task<IReadOnlyList<BenhNhan>> GetByDateRangeAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var from = (fromDate ?? DateTime.Today).Date;
            var to = (toDate ?? DateTime.Today).Date.AddDays(1).AddTicks(-1);

            return await _context.BenhNhans
                .AsNoTracking()
                .Include(b => b.BenhNhanCoSo)
                .ThenInclude(b => b.CoSo)
                .Include(b => b.LuotKhams)
                .Where(b => !b.IsDeleted && b.CreatedAt >= from && b.CreatedAt <= to)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách các bệnh nhân đã bị xóa mềm (IsDeleted = true).
        /// </summary>
        /// <returns>Danh sách bệnh nhân đã xóa (IReadOnlyList).</returns>
        public async Task<IReadOnlyList<BenhNhan>> GetDeletedAsync()
        {
            return await _context.BenhNhans
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Where(b => b.IsDeleted)
                .OrderByDescending(b => b.DeletedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách tiền sử bệnh của một bệnh nhân theo mã bệnh nhân.
        /// </summary>
        /// <param name="benhNhanId">Mã bệnh nhân (int).</param>
        /// <returns>Danh sách tiền sử (IReadOnlyList).</returns>
        public async Task<IReadOnlyList<TienSuBenh>> GetTienSuByBenhNhanIdAsync(int benhNhanId)
        {
            return await _context.TienSuBenhs
                .AsNoTracking()
                .Where(t => t.MaBenhNhan == benhNhanId && !t.IsDeleted)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy bản ghi tiền sử bệnh mới nhất của một bệnh nhân.
        /// </summary>
        /// <param name="benhNhanId">Mã bệnh nhân (int).</param>
        /// <returns>Đối tượng TienSuBenh nếu có, ngược lại null.</returns>
        public async Task<TienSuBenh?> GetLatestTienSuAsync(int benhNhanId)
        {
            return await _context.TienSuBenhs
                .AsNoTracking()
                .Where(t => t.MaBenhNhan == benhNhanId && !t.IsDeleted)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();
        }

        // ============================================================
        // PAGINATION HELPER
        // ============================================================

        /// <summary>
        /// Phân trang một IQueryable<BenhNhan> với thứ tự tùy chọn.
        /// </summary>
        /// <param name="pageIndex">Chỉ số trang (bắt đầu từ 1).</param>
        /// <param name="pageSize">Số lượng bản ghi mỗi trang.</param>
        /// <param name="query">IQueryable nguồn.</param>
        /// <param name="orderBy">Delegate để sắp xếp (nếu null thì mặc định theo Id).</param>
        /// <returns>Danh sách bệnh nhân trong trang (IReadOnlyList).</returns>
        public async Task<IReadOnlyList<BenhNhan>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            IQueryable<BenhNhan> query,
            Func<IQueryable<BenhNhan>, IOrderedQueryable<BenhNhan>>? orderBy = null)
        {
            if (orderBy != null)
                query = orderBy(query);
            else
                query = query.OrderBy(b => b.Id);

            return await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        /// <summary>
        /// Đếm tổng số bản ghi từ một IQueryable<BenhNhan>.
        /// </summary>
        /// <param name="query">IQueryable cần đếm.</param>
        /// <returns>Số lượng bản ghi (int).</returns>
        public async Task<int> CountAsync(IQueryable<BenhNhan> query)
        {
            return await query.CountAsync();
        }

        // ============================================================
        // PROFILE
        // ============================================================

        /// <summary>
        /// Lấy hồ sơ chi tiết của một bệnh nhân theo mã, bao gồm các thông tin liên quan:
        /// cơ sở, bảo hiểm, tiền sử, 5 lượt khám gần nhất (kèm bác sĩ, khoa, chẩn đoán),
        /// 5 hóa đơn gần nhất (kèm chi tiết).
        /// </summary>
        /// <param name="id">Mã bệnh nhân.</param>
        /// <param name="cancellationToken">Token hủy bỏ.</param>
        /// <returns>Đối tượng BenhNhan đầy đủ nếu tồn tại, ngược lại null.</returns>
        public async Task<BenhNhan?> GetPatientProfileAsync(int id, CancellationToken cancellationToken = default)
        {
            var luotKhamQuery = _context.LuotKhams
                .Where(l => !l.IsDeleted)
                .OrderByDescending(l => l.NgayKham)
                .Take(5);

            var hoaDonQuery = _context.HoaDons
                .Where(h => !h.IsDeleted)
                .OrderByDescending(h => h.NgayLap)
                .Take(5);

            return await _context.BenhNhans
                .AsNoTracking()
                .Include(b => b.BenhNhanCoSo).ThenInclude(bn => bn.CoSo)
                .Include(b => b.BaoHiems)
                .Include(b => b.TienSuBenhs)
                .Include(b => b.LuotKhams.Where(l => luotKhamQuery.Contains(l)))
                    .ThenInclude(l => l.BacSi)
                .Include(b => b.LuotKhams.Where(l => luotKhamQuery.Contains(l)))
                    .ThenInclude(l => l.Khoa)
                .Include(b => b.LuotKhams.Where(l => luotKhamQuery.Contains(l)))
                    .ThenInclude(l => l.ChanDoans)
                .Include(b => b.HoaDons.Where(h => hoaDonQuery.Contains(h)))
                    .ThenInclude(h => h.ChiTietHoaDons)
                .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted, cancellationToken);
        }

        // ============================================================
        // TAB: LỊCH SỬ KHÁM
        // ============================================================

        /// <summary>
        /// Lấy danh sách lượt khám của một bệnh nhân có phân trang và lọc theo trạng thái, ngày tháng.
        /// </summary>
        /// <param name="patientId">Mã bệnh nhân.</param>
        /// <param name="pageIndex">Chỉ số trang (bắt đầu 1).</param>
        /// <param name="pageSize">Số bản ghi mỗi trang.</param>
        /// <param name="status">Lọc theo trạng thái (chuỗi enum), có thể null.</param>
        /// <param name="fromDate">Ngày bắt đầu lọc, có thể null.</param>
        /// <param name="toDate">Ngày kết thúc lọc, có thể null.</param>
        /// <param name="cancellationToken">Token hủy bỏ.</param>
        /// <returns>Tuple (Items: danh sách lượt khám, TotalCount: tổng số bản ghi).</returns>
        public async Task<(IReadOnlyList<LuotKham> Items, int TotalCount)> GetVisitsByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            string? status = null,
            DateTime? fromDate = null,
            DateTime? toDate = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.LuotKhams
                .AsNoTracking()
                .Where(l => l.MaBenhNhan == patientId && !l.IsDeleted);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(l => l.TrangThai.ToString() == status);

            if (fromDate.HasValue)
                query = query.Where(l => l.NgayKham >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(l => l.NgayKham <= toDate.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Include(l => l.BacSi)
                .Include(l => l.Khoa)
                .Include(l => l.ChanDoans).ThenInclude(c => c.ICD)
                .Include(l => l.SinhHieus)
                .Include(l => l.ChiDinhDichVus).ThenInclude(cd => cd.DanhMucDichVu)
                .Include(l => l.ChiDinhDichVus).ThenInclude(cd => cd.ChiTietKetQuaXetNghiems)
                .Include(l => l.DonThuocs).ThenInclude(d => d.ChiTietDonThuocs).ThenInclude(ct => ct.Item)
                .OrderByDescending(l => l.NgayKham)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        // ============================================================
        // TAB: ĐƠN THUỐC
        // ============================================================

        /// <summary>
        /// Lấy danh sách đơn thuốc của một bệnh nhân (có phân trang).
        /// </summary>
        /// <param name="patientId">Mã bệnh nhân.</param>
        /// <param name="pageIndex">Chỉ số trang.</param>
        /// <param name="pageSize">Số bản ghi mỗi trang.</param>
        /// <param name="cancellationToken">Token hủy bỏ.</param>
        /// <returns>Tuple (Items: danh sách đơn thuốc, TotalCount: tổng số).</returns>
        public async Task<(IReadOnlyList<DonThuoc> Items, int TotalCount)> GetPrescriptionsByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var query = _context.DonThuocs
                .AsNoTracking()
                .Where(d => d.MaLuotKham != null && d.LuotKham.MaBenhNhan == patientId && !d.IsDeleted);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Include(d => d.BacSi)
                .Include(d => d.ChiTietDonThuocs).ThenInclude(ct => ct.Item)
                .OrderByDescending(d => d.NgayKe)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        // ============================================================
        // TAB: XÉT NGHIỆM
        // ============================================================

        /// <summary>
        /// Lấy danh sách các chỉ định dịch vụ xét nghiệm của một bệnh nhân (có phân trang).
        /// </summary>
        /// <param name="patientId">Mã bệnh nhân.</param>
        /// <param name="pageIndex">Chỉ số trang.</param>
        /// <param name="pageSize">Số bản ghi mỗi trang.</param>
        /// <param name="cancellationToken">Token hủy bỏ.</param>
        /// <returns>Tuple (Items: danh sách chi định xét nghiệm, TotalCount: tổng số).</returns>
        public async Task<(IReadOnlyList<ChiDinhDichVu> Items, int TotalCount)> GetLabResultsByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default)
        {
            var query = _context.ChiDinhDichVus
                .AsNoTracking()
                .Where(cd => cd.MaLuotKham != null && cd.LuotKham.MaBenhNhan == patientId && !cd.IsDeleted)
                .Where(cd => cd.DanhMucDichVu.LoaiDichVu == LoaiDichVu.XetNghiem);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Include(cd => cd.DanhMucDichVu)
                .Include(cd => cd.ChiTietKetQuaXetNghiems)
                .OrderByDescending(cd => cd.NgayChiDinh)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        // ============================================================
        // TAB: HÓA ĐƠN
        // ============================================================

        /// <summary>
        /// Lấy danh sách hóa đơn của một bệnh nhân (có phân trang và lọc theo trạng thái).
        /// </summary>
        /// <param name="patientId">Mã bệnh nhân.</param>
        /// <param name="pageIndex">Chỉ số trang.</param>
        /// <param name="pageSize">Số bản ghi mỗi trang.</param>
        /// <param name="status">Lọc theo trạng thái hóa đơn (chuỗi enum), có thể null.</param>
        /// <param name="cancellationToken">Token hủy bỏ.</param>
        /// <returns>Tuple (Items: danh sách hóa đơn, TotalCount: tổng số).</returns>
        public async Task<(IReadOnlyList<HoaDon> Items, int TotalCount)> GetInvoicesByPatientIdAsync(
            int patientId,
            int pageIndex = 1,
            int pageSize = 10,
            string? status = null,
            CancellationToken cancellationToken = default)
        {
            var query = _context.HoaDons
                .AsNoTracking()
                .Where(h => h.MaBenhNhan == patientId && !h.IsDeleted);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(h => h.TrangThai.ToString() == status);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Include(h => h.ChiTietHoaDons)
                .Include(h => h.PhieuThus).ThenInclude(p => p.NguoiThu)
                .Include(h => h.CongNoBenhNhan)
                .OrderByDescending(h => h.NgayLap)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        // ============================================================
        // CÁC THỐNG KÊ (Count)
        // ============================================================

        /// <summary>
        /// Đếm tổng số bệnh nhân chưa bị xóa mềm.
        /// </summary>
        /// <returns>Số lượng (int).</returns>
        public async Task<int> CountBenhNhanAsync()
        {
            return await _context.BenhNhans.CountAsync(b => !b.IsDeleted);
        }

        /// <summary>
        /// Đếm số lượt khám đang ở trạng thái "Đang khám".
        /// </summary>
        /// <returns>Số lượng (int).</returns>
        public async Task<int> CountDangKhamAsync()
        {
            return await _context.LuotKhams
                .CountAsync(l => l.TrangThai == TrangThaiLuotKham.DANG_KHAM && !l.IsDeleted);
        }

        /// <summary>
        /// Đếm số lượt khám đang ở trạng thái "Chờ khám".
        /// </summary>
        /// <returns>Số lượng (int).</returns>
        public async Task<int> CountChoKhamAsync()
        {
            return await _context.LuotKhams
                .CountAsync(l => l.TrangThai == TrangThaiLuotKham.CHO_KHAM && !l.IsDeleted);
        }

        /// <summary>
        /// Đếm số lượt khám đang ở trạng thái "Hoàn thành".
        /// </summary>
        /// <returns>Số lượng (int).</returns>
        public async Task<int> CountHoanThanhAsync()
        {
            return await _context.LuotKhams
                .CountAsync(l => l.TrangThai == TrangThaiLuotKham.HOAN_THANH && !l.IsDeleted);
        }

        /// <summary>
        /// Đếm số lượt khám đang ở trạng thái "Đã hủy".
        /// </summary>
        /// <returns>Số lượng (int).</returns>
        public async Task<int> CountHuyAsync()
        {
            return await _context.LuotKhams
                .CountAsync(l => l.TrangThai == TrangThaiLuotKham.DA_HUY && !l.IsDeleted);
        }

        // ============================================================
        // PHƯƠNG THỨC LẤY DANH SÁCH BỆNH NHÂN PHÂN TRANG (CÓ LƯỢT KHÁM GẦN NHẤT)
        // ============================================================

        /// <summary>
        /// Lấy danh sách bệnh nhân có phân trang, kèm theo lượt khám gần nhất của mỗi bệnh nhân.
        /// Hỗ trợ lọc theo từ khóa, trạng thái lượt khám, khoa, cơ sở.
        /// </summary>
        /// <param name="pageIndex">Chỉ số trang (bắt đầu từ 1).</param>
        /// <param name="pageSize">Số bản ghi mỗi trang.</param>
        /// <param name="keyword">Từ khóa tìm kiếm (Họ, Tên, CCCD, Điện thoại, Mã nội bộ) – có thể null.</param>
        /// <param name="trangThai">Trạng thái lượt khám (chuỗi enum) – có thể null.</param>
        /// <param name="maKhoa">Mã khoa lọc – có thể null.</param>
        /// <param name="maCoSo">Mã cơ sở lọc – có thể null.</param>
        /// <param name="cancellationToken">Token hủy bỏ.</param>
        /// <returns>
        /// Tuple (Items, TotalCount) trong đó:
        ///   - Items: IReadOnlyList<(BenhNhan BenhNhan, LuotKham LuotKhamGanNhat)>,
        ///   - TotalCount: tổng số bản ghi thỏa mãn điều kiện lọc (trước phân trang).
        /// </returns>
        public async Task<(IReadOnlyList<(BenhNhan BenhNhan, LuotKham LuotKhamGanNhat)> Items, int TotalCount)>
            GetBenhNhanPagedAsync(
            int pageIndex,
            int pageSize,
            string? keyword = null,
            string? trangThai = null,
            int? maKhoa = null,
            int? maCoSo = null,
            CancellationToken cancellationToken = default)
        {
            // Bắt đầu query từ BenhNhan, Include các navigation cần thiết
            var query = _context.BenhNhans
                .AsNoTracking()
                .Include(b => b.BenhNhanCoSo)
                .Include(b => b.LuotKhams)
                    .ThenInclude(l => l.Khoa)
                .Include(b => b.LuotKhams)
                    .ThenInclude(l => l.BacSi)
                .Where(b => !b.IsDeleted);

            // Lọc theo từ khóa
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var kw = keyword.Trim().ToLower();
                query = query.Where(b =>
                    b.Ho.ToLower().Contains(kw) ||
                    b.Ten.ToLower().Contains(kw) ||
                    b.SoCCCD.Contains(kw) ||
                    b.DienThoai.Contains(kw) ||
                    b.BenhNhanCoSo.Any(bn => bn.MaBenhNhanNoiBo.ToLower().Contains(kw))
                );
            }

            // Lọc theo cơ sở (nếu có)
            if (maCoSo.HasValue)
            {
                query = query.Where(b => b.BenhNhanCoSo.Any(bn => bn.MaCoSo == maCoSo.Value));
            }

            // Chọn mỗi bệnh nhân cùng với lượt khám gần nhất (theo NgayKham)
            var queryWithLatestVisit = query
                .Select(b => new
                {
                    BenhNhan = b,
                    LuotKhamGanNhat = b.LuotKhams
                        .Where(l => !l.IsDeleted)
                        .OrderByDescending(l => l.NgayKham)
                        .FirstOrDefault()
                })
                .Where(x => x.LuotKhamGanNhat != null); // Chỉ lấy bệnh nhân có ít nhất 1 lượt khám

            // Lọc theo trạng thái lượt khám
            if (!string.IsNullOrWhiteSpace(trangThai))
            {
                if (Enum.TryParse<TrangThaiLuotKham>(trangThai, true, out var status))
                {
                    queryWithLatestVisit = queryWithLatestVisit
                        .Where(x => x.LuotKhamGanNhat.TrangThai == status);
                }
            }

            // Lọc theo khoa
            if (maKhoa.HasValue)
            {
                queryWithLatestVisit = queryWithLatestVisit
                    .Where(x => x.LuotKhamGanNhat.MaKhoa == maKhoa.Value);
            }

            // Lọc theo cơ sở (nếu chưa lọc ở trên, nhưng đã lọc qua BenhNhanCoSo)
            if (maCoSo.HasValue)
            {
                queryWithLatestVisit = queryWithLatestVisit
                    .Where(x => x.LuotKhamGanNhat.MaCoSo == maCoSo.Value);
            }

            // Đếm tổng số
            var totalCount = await queryWithLatestVisit.CountAsync(cancellationToken);

            // Phân trang và lấy dữ liệu
            var items = await queryWithLatestVisit
                .OrderByDescending(x => x.LuotKhamGanNhat.NgayKham)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            // Chuyển sang dạng tuple
            var result = items
                .Select(x => (x.BenhNhan, x.LuotKhamGanNhat))
                .ToList()
                .AsReadOnly();

            return (result, totalCount);
        }
    }
}