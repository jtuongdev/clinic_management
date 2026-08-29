using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class PhanCongConfiguration : IEntityTypeConfiguration<PhanCong>
    {
        public void Configure(EntityTypeBuilder<PhanCong> builder)
        {
            builder.ToTable("PhanCong");
            builder.HasKey(pc => pc.Id);

            builder.Property(pc => pc.LoaiCongViec)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(pc => pc.ThoiGianBatDau)
                .IsRequired();

            builder.Property(pc => pc.ThoiGianKetThuc)
                .IsRequired();

            builder.Property(pc => pc.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(pc => pc.NhanVien)
                .WithMany()
                .HasForeignKey(pc => pc.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(pc => new { pc.MaNhanVien, pc.ThoiGianBatDau, pc.ThoiGianKetThuc });

            builder.HasQueryFilter(pc => !pc.IsDeleted);
        }
    }
}