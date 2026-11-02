using ClinicManagement.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;

public class LichLamViecDieuChinhConfiguration : IEntityTypeConfiguration<LichLamViecDieuChinh>
{
    public void Configure(EntityTypeBuilder<LichLamViecDieuChinh> builder)
    {
        builder.ToTable("LichLamViecDieuChinh");
        builder.HasKey(item => item.Id);
        builder.Property(item => item.TrangThaiCu).HasMaxLength(20).IsRequired();
        builder.Property(item => item.TrangThaiMoi).HasMaxLength(20).IsRequired();
        builder.Property(item => item.LyDo).HasMaxLength(500).IsRequired();
        builder.HasOne(item => item.LichLamViec).WithMany().HasForeignKey(item => item.MaLichLamViec).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(item => new { item.MaLichLamViec, item.ThoiDiem });
        builder.HasQueryFilter(item => !item.IsDeleted);
    }
}
