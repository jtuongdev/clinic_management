using ClinicManagement.Domain.Payroll;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class KyLuongConfiguration : IEntityTypeConfiguration<KyLuong>
    {
        public void Configure(EntityTypeBuilder<KyLuong> builder)
        {
            builder.ToTable("KyLuong");
            builder.HasKey(k => k.Id);

            builder.Property(k => k.TrangThai)
                .IsRequired()
                .HasMaxLength(30);
            builder.Property(k => k.IsPublished).HasDefaultValue(false);
            builder.Property(k => k.MaKyChamCong);
            builder.HasOne<ClinicManagement.Domain.Identity.KyChamCong>()
                .WithMany().HasForeignKey(k => k.MaKyChamCong).OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(k => new { k.Thang, k.Nam })
                .IsUnique();

            builder.HasQueryFilter(k => !k.IsDeleted);
        }
    }
}
