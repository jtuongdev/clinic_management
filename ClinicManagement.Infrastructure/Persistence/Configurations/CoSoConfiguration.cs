using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class CoSoConfiguration : IEntityTypeConfiguration<CoSo>
    {
        public void Configure(EntityTypeBuilder<CoSo> builder)
        {
            builder.ToTable("CoSo");
            builder.HasKey(c => c.Id);
            
            builder.Property(c => c.LoaiCoSo)
                .HasConversion<string>()
                .HasMaxLength(30);
                
            builder.Property(c => c.Ma)
                .IsRequired()
                .HasMaxLength(20);
            builder.HasIndex(c => c.Ma)
                .IsUnique();
                
            builder.Property(c => c.Ten)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(c => c.DiaChi)
                .HasMaxLength(255);
                
            builder.Property(c => c.DienThoai)
                .HasMaxLength(20);
                
            builder.Property(c => c.Email)
                .HasMaxLength(100);
                
            builder.Property(c => c.TrangThai)
                .IsRequired()
                .HasMaxLength(20);
                
        }
    }
}
