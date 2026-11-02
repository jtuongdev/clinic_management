using ClinicManagement.Domain.Payroll;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiTietBangLuongConfiguration : IEntityTypeConfiguration<ChiTietBangLuong>
    {
        public void Configure(EntityTypeBuilder<ChiTietBangLuong> builder)
        {
            builder.ToTable("ChiTietBangLuong");
            builder.HasKey(c => c.Id);

            builder.Property(c => c.LoaiKhoan)
                .IsRequired()
                .HasMaxLength(20);
            builder.Property(c => c.TenKhoan)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(c => c.SoTien)
                .HasPrecision(18, 2);
            builder.Property(c => c.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(c => c.BangLuong)
                .WithMany(b => b.ChiTiets)
                .HasForeignKey(c => c.MaBangLuong)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasQueryFilter(c => !c.IsDeleted);
        }
    }
}
