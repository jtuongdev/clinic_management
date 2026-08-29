using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class HoaDonConfiguration : IEntityTypeConfiguration<HoaDon>
    {
        public void Configure(EntityTypeBuilder<HoaDon> builder)
        {
            builder.ToTable("HoaDon");
            builder.HasKey(h => h.Id);
            
            builder.Property(h => h.SoHoaDon)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(h => h.SoHoaDon)
                .IsUnique();
                
            builder.Property(h => h.TongTien)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(h => h.SoTienBaoHiemChiTra)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(h => h.SoTienBenhNhanChiTra)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(h => h.DaThanhToan)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(h => h.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            builder.Property(h => h.GhiChu)
                .HasMaxLength(500);
            
            builder.HasOne(h => h.LuotKham)
                .WithMany(l => l.HoaDons)
                .HasForeignKey(h => h.MaLuotKham)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(h => h.BenhNhan)
                .WithMany(b => b.HoaDons)
                .HasForeignKey(h => h.MaBenhNhan)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(h => h.CoSo)
                .WithMany()
                .HasForeignKey(h => h.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(h => h.ChiTietHoaDons)
                .WithOne(ct => ct.HoaDon)
                .HasForeignKey(ct => ct.MaHoaDon)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(h => h.PhieuThus)
                .WithOne(pt => pt.HoaDon)
                .HasForeignKey(pt => pt.MaHoaDon)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(h => h.CongNoBenhNhan)
                .WithOne(cn => cn.HoaDon)
                .HasForeignKey<CongNoBenhNhan>(cn => cn.MaHoaDon)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasIndex(h => h.MaBenhNhan);
            builder.HasIndex(h => h.TrangThai);
            builder.HasIndex(h => h.NgayLap);
        }
    }
}
