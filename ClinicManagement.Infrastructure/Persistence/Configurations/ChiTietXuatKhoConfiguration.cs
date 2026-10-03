using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiTietXuatKhoConfiguration : IEntityTypeConfiguration<ChiTietXuatKho>
    {
        public void Configure(EntityTypeBuilder<ChiTietXuatKho> builder)
        {
            builder.ToTable("ChiTietXuatKho");
            builder.HasKey(ct => ct.Id);
            
            builder.Property(ct => ct.SoLuongXuat)
                .HasColumnType("decimal(12,3)");
                
            builder.Property(ct => ct.DonGiaXuat)
                .HasColumnType("decimal(18,2)");
            
            builder.HasOne(ct => ct.PhieuXuatKho)
                .WithMany(px => px.ChiTietXuatKhos)
                .HasForeignKey(ct => ct.MaPhieuXuat)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(ct => ct.ChiTietNhapKho)
                .WithMany()
                .HasForeignKey(ct => ct.MaChiTietNhap)
                .OnDelete(DeleteBehavior.Restrict);

            // FK tùy chọn: mặt hàng yêu cầu trước khi Admin gán lô FEFO
            builder.HasOne(ct => ct.ItemYeuCau)
                .WithMany()
                .HasForeignKey(ct => ct.MaItemYeuCau)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.HasIndex(ct => ct.MaPhieuXuat);
            builder.HasIndex(ct => ct.MaChiTietNhap);
            builder.HasIndex(ct => ct.MaItemYeuCau);
        }
    }
}
