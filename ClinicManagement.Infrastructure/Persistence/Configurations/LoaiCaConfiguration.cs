using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class LoaiCaConfiguration : IEntityTypeConfiguration<LoaiCa>
    {
        public void Configure(EntityTypeBuilder<LoaiCa> builder)
        {
            builder.ToTable("LoaiCa");
            builder.HasKey(lc => lc.Id);

            builder.Property(lc => lc.Ma)
                .IsRequired()
                .HasMaxLength(20);
            builder.HasIndex(lc => lc.Ma).IsUnique();

            builder.Property(lc => lc.TenLoai)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(lc => lc.MoTa)
                .HasMaxLength(255);

            builder.HasQueryFilter(lc => !lc.IsDeleted);
        }
    }
}