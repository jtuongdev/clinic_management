using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class PhieuXuatKhoConfiguration : IEntityTypeConfiguration<PhieuXuatKho>
    {
        public void Configure(EntityTypeBuilder<PhieuXuatKho> builder)
        {
            builder.ToTable("PhieuXuatKho");
            builder.HasKey(px => px.Id);
            
            builder.Property(px => px.MaPhieu)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(px => px.MaPhieu)
                .IsUnique();
                
            builder.Property(px => px.LoaiXuat)
                .HasConversion<string>()
                .HasMaxLength(30);
                
            builder.Property(px => px.GhiChu)
                .HasMaxLength(500);
            
            builder.HasOne(px => px.KhoXuat)
                .WithMany(k => k.PhieuXuatKhos)
                .HasForeignKey(px => px.MaKhoXuat)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(px => px.KhoNhan)
                .WithMany()
                .HasForeignKey(px => px.MaKhoNhan)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(px => px.DonThuoc)
                .WithMany()
                .HasForeignKey(px => px.MaDonThuoc)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasOne(px => px.NguoiXuat)
                .WithMany()
                .HasForeignKey(px => px.MaNguoiXuat)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(px => px.ChiTietXuatKhos)
                .WithOne(ct => ct.PhieuXuatKho)
                .HasForeignKey(ct => ct.MaPhieuXuat)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(px => px.NgayXuat);
            builder.HasIndex(px => px.LoaiXuat);
        }
    }
}
