using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class LichLamViecConfiguration : IEntityTypeConfiguration<LichLamViec>
    {
        public void Configure(EntityTypeBuilder<LichLamViec> builder)
        {
            builder.ToTable("LichLamViec");
            builder.HasKey(llv => llv.Id);

            builder.Property(llv => llv.NgayLam)
                .IsRequired();

            builder.Property(llv => llv.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(llv => llv.NhanVien)
                .WithMany()
                .HasForeignKey(llv => llv.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(llv => llv.CaTruc)
                .WithMany(ct => ct.LichLamViecs)
                .HasForeignKey(llv => llv.MaCaTruc)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(llv => new { llv.MaNhanVien, llv.NgayLam })
                .IsUnique();

            builder.HasQueryFilter(llv => !llv.IsDeleted);
        }
    }
}