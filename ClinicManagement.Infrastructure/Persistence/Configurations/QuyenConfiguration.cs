using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class QuyenConfiguration : IEntityTypeConfiguration<Quyen>
    {
        public void Configure(EntityTypeBuilder<Quyen> builder)
        {
            builder.ToTable("Quyen");
            builder.HasKey(q => q.Id);
            builder.Property(q => q.TenQuyen)
                .IsRequired()
                .HasMaxLength(100);
            builder.HasIndex(q => q.TenQuyen)
                .IsUnique();
            builder.Property(q => q.MoTa)
                .HasMaxLength(255);
        }
    }
}