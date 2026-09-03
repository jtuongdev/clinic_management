using Microsoft.EntityFrameworkCore;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Patient;
using ClinicManagement.Domain.Appointment;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Service;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.System;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace ClinicManagement.Infrastructure.Persistence
{
    public class ClinicDbContext : DbContext, IUnitOfWork
    {
        public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options) { }

        // Phân hệ Identity
        public DbSet<NhanVien> NhanViens { get; set; }
        public DbSet<ChucVu> ChucVus { get; set; }
        public DbSet<VaiTro> VaiTros { get; set; }
        public DbSet<Quyen> Quyens { get; set; }
        public DbSet<VaiTroQuyen> VaiTroQuyens { get; set; }
        public DbSet<NhanVienVaiTro> NhanVienVaiTros { get; set; }
        public DbSet<PhanQuyenCoSo> PhanQuyenCoSos { get; set; }
        public DbSet<LoaiCa> LoaiCas { get; set; }
        public DbSet<CaTruc> CaTrucs { get; set; }
        public DbSet<LichLamViec> LichLamViecs { get; set; }
        public DbSet<LichTruc> LichTrucs { get; set; }
        public DbSet<ChamCong> ChamCongs { get; set; }
        public DbSet<NghiPhep> NghiPheps { get; set; }
        public DbSet<PhanCong> PhanCongs { get; set; }

        // Phân hệ Cơ sở & Khoa phòng
        public DbSet<CoSo> CoSos { get; set; }
        public DbSet<Khoa> Khoas { get; set; }
        public DbSet<NhanVienKhoa> NhanVienKhoas { get; set; }
        public DbSet<PhongKham> PhongKhams { get; set; }

        // Phân hệ Bệnh nhân
        public DbSet<BenhNhan> BenhNhans { get; set; }
        public DbSet<BenhNhanCoSo> BenhNhanCoSos { get; set; }
        public DbSet<BaoHiem> BaoHiems { get; set; }
        public DbSet<TienSuBenh> TienSuBenhs { get; set; }

        // Phân hệ Lịch hẹn & Khám bệnh
        public DbSet<LichHen> LichHens { get; set; }
        public DbSet<LuotKham> LuotKhams { get; set; }
        public DbSet<ICD> ICDs { get; set; }
        public DbSet<ChanDoan> ChanDoans { get; set; }
        public DbSet<SinhHieu> SinhHieus { get; set; }

        // Phân hệ Dịch vụ & Cận lâm sàng
        public DbSet<DanhMucDichVu> DanhMucDichVus { get; set; }
        public DbSet<ChiDinhDichVu> ChiDinhDichVus { get; set; }
        public DbSet<ChiTietKetQuaXetNghiem> ChiTietKetQuaXetNghiems { get; set; }

        // Phân hệ Kho & Dược phẩm
        public DbSet<NhaCungCap> NhaCungCaps { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<DonViTinhQuyDoi> DonViTinhQuyDois { get; set; }
        public DbSet<Kho> Khos { get; set; }
        public DbSet<PhieuNhapKho> PhieuNhapKhos { get; set; }
        public DbSet<ChiTietNhapKho> ChiTietNhapKhos { get; set; }
        public DbSet<TonKho> TonKhos { get; set; }
        public DbSet<PhieuXuatKho> PhieuXuatKhos { get; set; }
        public DbSet<ChiTietXuatKho> ChiTietXuatKhos { get; set; }

        // Phân hệ Đơn thuốc & Viện phí
        public DbSet<DonThuoc> DonThuocs { get; set; }
        public DbSet<ChiTietDonThuoc> ChiTietDonThuocs { get; set; }
        public DbSet<HoaDon> HoaDons { get; set; } 
        public DbSet<ChiTietHoaDon> ChiTietHoaDons { get; set; }
        public DbSet<PhieuThu> PhieuThus { get; set; }
        public DbSet<CongNoBenhNhan> CongNoBenhNhans { get; set; }

        // Phân hệ Bảng lương
        public DbSet<KyLuong> KyLuongs { get; set; }
        public DbSet<BangLuong> BangLuongs { get; set; }
        public DbSet<ChiTietBangLuong> ChiTietBangLuongs { get; set; }

        // Phân hệ Hệ thống
        public DbSet<ThamSoHeThong> ThamSoHeThongs { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ClinicDbContext).Assembly);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasQueryFilter(ConvertFilterExpression(entityType.ClrType));
                }
            }

            base.OnModelCreating(modelBuilder);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries();
            foreach (var entry in entries)
            {
                if (entry.Entity is BaseEntity)
                {
                    if (entry.State == EntityState.Added)
                    {
                        entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                    }
                    if (entry.State == EntityState.Modified)
                    {
                        entry.Property("CreatedAt").IsModified = false; 
                        entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                    }
                }
            }
            return await base.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
        {
            return await SaveChangesAsync(cancellationToken) > 0;
        }

        private static System.Linq.Expressions.LambdaExpression ConvertFilterExpression(Type entityType)
        {
            var parameter = System.Linq.Expressions.Expression.Parameter(entityType, "e");
            var property = System.Linq.Expressions.Expression.Property(parameter, "IsDeleted");
            var falseConstant = System.Linq.Expressions.Expression.Constant(false);
            var comparison = System.Linq.Expressions.Expression.Equal(property, falseConstant);
            return System.Linq.Expressions.Expression.Lambda(comparison, parameter);
        }
    }
}
