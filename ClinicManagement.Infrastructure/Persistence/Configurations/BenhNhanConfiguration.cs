using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class BenhNhanConfiguration : IEntityTypeConfiguration<BenhNhan>
    {
        public void Configure(EntityTypeBuilder<BenhNhan> builder)
        {
            builder.ToTable("BenhNhan");
            builder.HasKey(b => b.Id);
            
            builder.Property(b => b.Ho)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(b => b.Ten)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(b => b.GioiTinh)
                .HasConversion<string>()
                .HasMaxLength(10);
                
            builder.Property(b => b.Email)
                .HasMaxLength(100);
            builder.HasIndex(b => b.Email)
                .IsUnique()
                .HasFilter("[Email] IS NOT NULL");
                
            builder.Property(b => b.SoCCCD)
                .HasMaxLength(20);
            builder.HasIndex(b => b.SoCCCD)
                .IsUnique()
                .HasFilter("[SoCCCD] IS NOT NULL");
                
            builder.Property(b => b.DienThoai)
                .HasMaxLength(20);
                
            builder.Property(b => b.DiaChi)
                .HasMaxLength(255);
                
            builder.Property(b => b.NguoiLienHeTen)
                .HasMaxLength(100);
                
            builder.Property(b => b.NguoiLienHeDienThoai)
                .HasMaxLength(20);
                
            builder.Property(b => b.Username)
                .HasMaxLength(50);
            builder.HasIndex(b => b.Username)
                .IsUnique()
                .HasFilter("[Username] IS NOT NULL");
                
            builder.Property(b => b.PasswordHash)
                .HasMaxLength(500);
            
            builder.HasMany(b => b.BenhNhanCoSo)
                .WithOne(bn => bn.BenhNhan)
                .HasForeignKey(bn => bn.MaBenhNhan)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(b => b.BaoHiems)
                .WithOne(bh => bh.BenhNhan)
                .HasForeignKey(bh => bh.MaBenhNhan)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(b => b.TienSuBenhs)
                .WithOne(ts => ts.BenhNhan)
                .HasForeignKey(ts => ts.MaBenhNhan)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(b => b.LuotKhams)
                .WithOne(lk => lk.BenhNhan)
                .HasForeignKey(lk => lk.MaBenhNhan)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(b => b.HoaDons)
                .WithOne(h => h.BenhNhan)
                .HasForeignKey(h => h.MaBenhNhan)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
