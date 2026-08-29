using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Appointment;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class LichHenConfiguration : IEntityTypeConfiguration<LichHen>
    {
        public void Configure(EntityTypeBuilder<LichHen> builder)
        {
            builder.ToTable("LichHen");
            builder.HasKey(lh => lh.Id);
            
            builder.Property(lh => lh.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            builder.Property(lh => lh.LyDo)
                .HasMaxLength(500);
                
            builder.Property(lh => lh.NguonDat)
                .HasMaxLength(30);
            
            builder.HasOne(lh => lh.BenhNhan)
                .WithMany()
                .HasForeignKey(lh => lh.MaBenhNhan)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(lh => lh.BacSi)
                .WithMany()
                .HasForeignKey(lh => lh.MaBacSi)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(lh => lh.CoSo)
                .WithMany()
                .HasForeignKey(lh => lh.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(lh => lh.Khoa)
                .WithMany()
                .HasForeignKey(lh => lh.MaKhoa)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasIndex(lh => new { lh.MaBenhNhan, lh.ThoiGianBatDau });
            builder.HasIndex(lh => new { lh.MaBacSi, lh.ThoiGianBatDau });
            builder.HasIndex(lh => lh.ThoiGianBatDau);
        }
    }
}
