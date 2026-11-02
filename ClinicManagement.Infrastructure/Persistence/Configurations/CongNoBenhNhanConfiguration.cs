using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class CongNoBenhNhanConfiguration : IEntityTypeConfiguration<CongNoBenhNhan>
    {
        public void Configure(EntityTypeBuilder<CongNoBenhNhan> builder)
        {
            builder.ToTable("CongNoBenhNhan");
            builder.HasKey(cn => cn.Id);
            
            builder.Property(cn => cn.SoTienNo)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(cn => cn.SoTienDaTra)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(cn => cn.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(30);
            
            builder.HasOne(cn => cn.BenhNhan)
                .WithMany()
                .HasForeignKey(cn => cn.MaBenhNhan)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(cn => cn.HoaDon)
                .WithOne(h => h.CongNoBenhNhan)
                .HasForeignKey<CongNoBenhNhan>(cn => cn.MaHoaDon)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasIndex(cn => cn.MaBenhNhan);
            builder.HasIndex(cn => new { cn.TrangThai, cn.HanThanhToan });
        }
    }
}
