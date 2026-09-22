using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiTietNhapKhoConfiguration : IEntityTypeConfiguration<ChiTietNhapKho>
    {
        public void Configure(EntityTypeBuilder<ChiTietNhapKho> builder)
        {
            builder.ToTable("ChiTietNhapKho");
            builder.HasKey(ct => ct.Id);

            builder.Property(ct => ct.SoLuong)
                .HasColumnType("decimal(12,3)");

            builder.Property(ct => ct.DonGiaNhap)
                .HasColumnType("decimal(18,2)");

            builder.Property(ct => ct.SoLo)
                .HasMaxLength(50);

            builder.Property(ct => ct.ViTri)
                .HasMaxLength(100);

            builder.HasOne(ct => ct.PhieuNhapKho)
                .WithMany(pn => pn.ChiTietNhapKhos)
                .HasForeignKey(ct => ct.MaPhieuNhap)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ct => ct.Item)
                .WithMany()
                .HasForeignKey(ct => ct.MaItem)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ct => ct.DonViTinhQuyDoi)
                .WithMany()
                .HasForeignKey(ct => ct.MaQuyDoi)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(ct => ct.ChiTietDonDatHang)
                .WithMany(poLine => poLine.ChiTietNhapKhos)
                .HasForeignKey(ct => ct.MaChiTietDonDatHang)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(ct => ct.MaPhieuNhap);
            builder.HasIndex(ct => ct.MaItem);
            builder.HasIndex(ct => ct.MaChiTietDonDatHang);
        }
    }
}
