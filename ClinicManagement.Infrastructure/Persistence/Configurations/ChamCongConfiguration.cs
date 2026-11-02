using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChamCongConfiguration : IEntityTypeConfiguration<ChamCong>
    {
        public void Configure(EntityTypeBuilder<ChamCong> builder)
        {
            builder.ToTable("ChamCong");
            builder.HasKey(cc => cc.Id);

            builder.Property(cc => cc.NgayChamCong)
                .IsRequired();

            builder.Property(cc => cc.TrangThai)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(30);

            builder.Property(cc => cc.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(cc => cc.NhanVien)
                .WithMany()
                .HasForeignKey(cc => cc.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cc => cc.LichLamViec)
                .WithOne()
                .HasForeignKey<ChamCong>(cc => cc.MaLichLamViec)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(cc => cc.MaLichLamViec)
                .HasDatabaseName("IX_ChamCong_MaLichLamViec")
                .IsUnique()
                .HasFilter("[IsDeleted] = 0 AND [MaLichLamViec] IS NOT NULL");
            builder.HasQueryFilter(cc => !cc.IsDeleted);
        }
    }
}