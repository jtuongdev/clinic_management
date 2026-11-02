using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class VaiTroConfiguration : IEntityTypeConfiguration<VaiTro>
    {
        public void Configure(EntityTypeBuilder<VaiTro> builder)
        {
            builder.ToTable("VaiTro");
            builder.HasKey(v => v.Id);
            
            builder.Property(v => v.TenVaiTro)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(v => v.TenVaiTro)
                .IsUnique();
                
            builder.Property(v => v.MoTa)
                .HasMaxLength(255);
                
        }
    }
}
