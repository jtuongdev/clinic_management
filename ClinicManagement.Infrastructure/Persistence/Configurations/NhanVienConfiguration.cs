using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity; // ĐÃ SỬA: Đưa về đúng namespace chuẩn

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class NhanVienConfiguration : IEntityTypeConfiguration<NhanVien>
    {
        public void Configure(EntityTypeBuilder<NhanVien> builder)
        {
            builder.ToTable("NhanVien");
            builder.HasKey(n => n.Id);
            
            builder.Property(n => n.Username)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(n => n.Username)
                .IsUnique();
            
            builder.Property(n => n.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);
            
            builder.Property(n => n.HoTen)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.Property(n => n.GioiTinh)
                .HasConversion<string>()
                .HasMaxLength(10);
            
            builder.Property(n => n.Email)
                .HasMaxLength(100);
            builder.HasIndex(n => n.Email)
                .IsUnique()
                .HasFilter("[Email] IS NOT NULL");
            
            builder.Property(n => n.DienThoai)
                .HasMaxLength(20);
            
            builder.Property(n => n.ChuyenKhoa)
                .HasMaxLength(100);
            
            builder.Property(n => n.SoHanhNghe)
                .HasMaxLength(50);
            builder.Property(n => n.LuongCoBan).HasPrecision(18, 2);
            builder.HasIndex(n => n.SoHanhNghe)
                .IsUnique()
                .HasFilter("[SoHanhNghe] IS NOT NULL");
            
            builder.HasOne(n => n.ChucVu)
                .WithMany(c => c.NhanViens)
                .HasForeignKey(n => n.MaChucVu)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasMany(n => n.NhanVienVaiTro)
                .WithOne(nv => nv.NhanVien)
                .HasForeignKey(nv => nv.MaNhanVien)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(n => n.PhanQuyenCoSo)
                .WithOne(p => p.NhanVien)
                .HasForeignKey(p => p.MaNhanVien)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(n => n.NhanVienKhoa)
                .WithOne(nk => nk.NhanVien)
                .HasForeignKey(nk => nk.MaNhanVien)
                .OnDelete(DeleteBehavior.Cascade);
            
          
        }
    }
}
