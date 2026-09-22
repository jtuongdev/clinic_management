using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class PhieuNhapKhoConfiguration : IEntityTypeConfiguration<PhieuNhapKho>
    {
        public void Configure(EntityTypeBuilder<PhieuNhapKho> builder)
        {
            builder.ToTable("PhieuNhapKho");
            builder.HasKey(pn => pn.Id);
            
            builder.Property(pn => pn.MaPhieu)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(pn => pn.MaPhieu)
                .IsUnique();
                
            builder.Property(pn => pn.TongTien)
                .HasColumnType("decimal(18,2)");
                
            builder.Property(pn => pn.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(30);
                
            builder.Property(pn => pn.GhiChu)
                .HasMaxLength(500);
            
            builder.HasOne(pn => pn.CoSo)
                .WithMany()
                .HasForeignKey(pn => pn.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(pn => pn.Kho)
                .WithMany(k => k.PhieuNhapKhos)
                .HasForeignKey(pn => pn.MaKho)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(pn => pn.NhaCungCap)
                .WithMany(ncc => ncc.PhieuNhapKhos)
                .HasForeignKey(pn => pn.MaNhaCungCap)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(pn => pn.NguoiNhap)
                .WithMany()
                .HasForeignKey(pn => pn.MaNguoiNhap)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(pn => pn.DonDatHang)
                .WithMany(ddh => ddh.PhieuNhapKhos)
                .HasForeignKey(pn => pn.MaDonDatHang)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(pn => pn.ChiTietNhapKhos)
                .WithOne(ct => ct.PhieuNhapKho)
                .HasForeignKey(ct => ct.MaPhieuNhap)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(pn => pn.MaDonDatHang);
            builder.HasIndex(pn => pn.NgayNhap);
            builder.HasIndex(pn => pn.TrangThai);
        }
    }
}
