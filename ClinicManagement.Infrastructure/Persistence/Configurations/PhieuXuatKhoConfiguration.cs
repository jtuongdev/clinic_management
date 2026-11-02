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

            // ── Cấp phát nội bộ Khoa/Phòng ───────────────────────────────────
            builder.Property(px => px.TrangThaiXuat)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired(false);
            
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

            // FK → Khoa (Khoa/Phòng nhận)
            builder.HasOne(px => px.KhoaNhan)
                .WithMany()
                .HasForeignKey(px => px.MaKhoaNhan)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // FK → NhanVien (Trưởng khoa xác nhận nhận hàng)
            builder.HasOne(px => px.NguoiNhan)
                .WithMany()
                .HasForeignKey(px => px.NguoiNhanId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
            
            builder.HasMany(px => px.ChiTietXuatKhos)
                .WithOne(ct => ct.PhieuXuatKho)
                .HasForeignKey(ct => ct.MaPhieuXuat)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(px => px.NgayXuat);
            builder.HasIndex(px => px.LoaiXuat);
            // Index composite cho các truy vấn theo khoa + trạng thái
            builder.HasIndex(px => new { px.LoaiXuat, px.TrangThaiXuat, px.MaKhoaNhan })
                .HasDatabaseName("IX_PhieuXuatKho_LoaiXuat_TrangThai_Khoa");
        }
    }
}
