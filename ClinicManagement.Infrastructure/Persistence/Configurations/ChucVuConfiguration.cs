using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChucVuConfiguration : IEntityTypeConfiguration<ChucVu>
    {
        public void Configure(EntityTypeBuilder<ChucVu> builder)
        {
            builder.ToTable("ChucVu");
            builder.HasKey(c => c.Id);
            
            builder.Property(c => c.TenChucVu)
                .IsRequired()
                .HasMaxLength(100);
            builder.HasIndex(c => c.TenChucVu)
                .IsUnique();
                
            builder.Property(c => c.MoTa)
                .HasMaxLength(255);
                
        }
    }
}
