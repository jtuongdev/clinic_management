using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Service;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class DanhMucDichVuConfiguration : IEntityTypeConfiguration<DanhMucDichVu>
    {
        public void Configure(EntityTypeBuilder<DanhMucDichVu> builder)
        {
            builder.ToTable("DanhMucDichVu");
            builder.HasKey(d => d.Id);
            
            builder.Property(d => d.LoaiDichVu)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            builder.Property(d => d.Ma)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(d => d.Ten)
                .IsRequired()
                .HasMaxLength(255);
                
            builder.Property(d => d.DonViTinh)
                .HasMaxLength(50);
                
            builder.Property(d => d.Gia)
                .HasColumnType("decimal(18,2)");
            
            builder.HasIndex(d => new { d.LoaiDichVu, d.Ma })
                .IsUnique();

            builder.HasIndex(d => d.Ten);
        }
    }
}
