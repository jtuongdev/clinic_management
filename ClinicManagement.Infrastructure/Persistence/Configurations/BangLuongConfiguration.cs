using ClinicManagement.Domain.Payroll;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class BangLuongConfiguration : IEntityTypeConfiguration<BangLuong>
    {
        public void Configure(EntityTypeBuilder<BangLuong> builder)
        {
            builder.ToTable("BangLuong");
            builder.HasKey(b => b.Id);

            builder.Property(b => b.LuongCoBan).HasPrecision(18, 2);
            builder.Property(b => b.SoNgayCong).HasPrecision(8, 2);
            builder.Property(b => b.SoNgayNghiKhongLuong).HasPrecision(8, 2);
            builder.Property(b => b.TongPhuCap).HasPrecision(18, 2);
            builder.Property(b => b.TongKhauTru).HasPrecision(18, 2);
            builder.Property(b => b.ThucLinh).HasPrecision(18, 2);
            builder.Property(b => b.TienNoKyNay).HasPrecision(18, 2);
            builder.Property(b => b.TienThuLaoKham).HasPrecision(18, 2).HasDefaultValue(0m);
            builder.Property(b => b.TienHoaHongCls).HasPrecision(18, 2).HasDefaultValue(0m);
            builder.Property(b => b.MaKyChamCong);

            builder.HasOne(b => b.KyLuong)
                .WithMany(k => k.BangLuongs)
                .HasForeignKey(b => b.MaKyLuong)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.NhanVien)
                .WithMany()
                .HasForeignKey(b => b.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(b => new { b.MaKyLuong, b.MaNhanVien })
                .IsUnique();

            builder.HasQueryFilter(b => !b.IsDeleted);
        }
    }
}
