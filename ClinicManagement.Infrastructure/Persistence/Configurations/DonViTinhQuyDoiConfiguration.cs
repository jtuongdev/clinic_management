using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class DonViTinhQuyDoiConfiguration : IEntityTypeConfiguration<DonViTinhQuyDoi>
    {
        public void Configure(EntityTypeBuilder<DonViTinhQuyDoi> builder)
        {
            builder.ToTable("DonViTinhQuyDoi");
            builder.HasKey(dv => dv.Id);
            
            builder.Property(dv => dv.DonVi)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.Property(dv => dv.HeSo)
                .HasColumnType("decimal(12,5)");
                
            builder.HasIndex(dv => new { dv.MaItem, dv.DonVi })
                .IsUnique();
            
            builder.HasOne(dv => dv.Item)
                .WithMany(i => i.DonViTinhQuyDois)
                .HasForeignKey(dv => dv.MaItem)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
