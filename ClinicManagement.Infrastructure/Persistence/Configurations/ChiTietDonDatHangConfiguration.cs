using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiTietDonDatHangConfiguration : IEntityTypeConfiguration<ChiTietDonDatHang>
    {
        public void Configure(EntityTypeBuilder<ChiTietDonDatHang> builder)
        {
            builder.ToTable("ChiTietDonDatHang");
            builder.HasKey(ct => ct.Id);

            builder.Property(ct => ct.SoLuongDat)
                .HasColumnType("decimal(12,3)");

            builder.Property(ct => ct.SoLuongDaNhap)
                .HasColumnType("decimal(12,3)");

            builder.Property(ct => ct.DonGiaDat)
                .HasColumnType("decimal(18,2)");

            builder.Property(ct => ct.DonViTinh)
                .HasMaxLength(50);

            builder.Property(ct => ct.GhiChu)
                .HasMaxLength(255);

            builder.HasOne(ct => ct.DonDatHang)
                .WithMany(ddh => ddh.ChiTietDonDatHangs)
                .HasForeignKey(ct => ct.MaDonDatHang)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ct => ct.Item)
                .WithMany()
                .HasForeignKey(ct => ct.MaItem)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ct => ct.DonViTinhQuyDoi)
                .WithMany()
                .HasForeignKey(ct => ct.MaQuyDoi)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(ct => ct.MaDonDatHang);
            builder.HasIndex(ct => ct.MaItem);
        }
    }
}
