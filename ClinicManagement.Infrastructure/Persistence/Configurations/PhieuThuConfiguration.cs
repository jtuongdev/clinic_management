using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class PhieuThuConfiguration : IEntityTypeConfiguration<PhieuThu>
    {
        public void Configure(EntityTypeBuilder<PhieuThu> builder)
        {
            builder.ToTable("PhieuThu");
            builder.HasKey(pt => pt.Id);
            
            builder.Property(pt => pt.SoPhieuThu)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(pt => pt.SoPhieuThu)
                .IsUnique();
                
            builder.Property(pt => pt.SoTien)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(pt => pt.PhuongThuc)
                .HasConversion<string>()
                .HasMaxLength(30);
                
            builder.Property(pt => pt.GhiChu)
                .IsRequired()
                .HasMaxLength(500)
                .HasDefaultValue(string.Empty);
            
            builder.HasOne(pt => pt.BenhNhan)
                .WithMany()
                .HasForeignKey(pt => pt.MaBenhNhan)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(pt => pt.LuotKham)
                .WithMany()
                .HasForeignKey(pt => pt.MaLuotKham)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasOne(pt => pt.HoaDon)
                .WithMany(h => h.PhieuThus)
                .HasForeignKey(pt => pt.MaHoaDon)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(pt => pt.NguoiThu)
                .WithMany()
                .HasForeignKey(pt => pt.MaNguoiThu)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(pt => pt.MaHoaDon);
            builder.HasIndex(pt => pt.NgayThu);
        }
    }
}
