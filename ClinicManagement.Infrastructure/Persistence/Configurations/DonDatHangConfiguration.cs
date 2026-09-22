using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class DonDatHangConfiguration : IEntityTypeConfiguration<DonDatHang>
    {
        public void Configure(EntityTypeBuilder<DonDatHang> builder)
        {
            builder.ToTable("DonDatHang");
            builder.HasKey(ddh => ddh.Id);

            builder.Property(ddh => ddh.MaDonDatHang)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(ddh => ddh.MaDonDatHang)
                .IsUnique();

            builder.Property(ddh => ddh.TongTien)
                .HasColumnType("decimal(18,2)");

            builder.Property(ddh => ddh.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(30);

            builder.Property(ddh => ddh.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(ddh => ddh.CoSo)
                .WithMany()
                .HasForeignKey(ddh => ddh.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ddh => ddh.Kho)
                .WithMany()
                .HasForeignKey(ddh => ddh.MaKho)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ddh => ddh.NhaCungCap)
                .WithMany()
                .HasForeignKey(ddh => ddh.MaNhaCungCap)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ddh => ddh.NguoiDat)
                .WithMany()
                .HasForeignKey(ddh => ddh.MaNguoiDat)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(ddh => ddh.ChiTietDonDatHangs)
                .WithOne(ct => ct.DonDatHang)
                .HasForeignKey(ct => ct.MaDonDatHang)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(ddh => ddh.PhieuNhapKhos)
                .WithOne(pn => pn.DonDatHang)
                .HasForeignKey(pn => pn.MaDonDatHang)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(ddh => ddh.NgayDat);
            builder.HasIndex(ddh => ddh.TrangThai);
        }
    }
}
