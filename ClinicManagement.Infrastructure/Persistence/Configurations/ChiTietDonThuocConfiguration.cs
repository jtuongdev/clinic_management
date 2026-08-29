using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Prescription;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiTietDonThuocConfiguration : IEntityTypeConfiguration<ChiTietDonThuoc>
    {
        public void Configure(EntityTypeBuilder<ChiTietDonThuoc> builder)
        {
            builder.ToTable("ChiTietDonThuoc");
            builder.HasKey(ct => ct.Id);
            
            builder.Property(ct => ct.SoLuongKe)
                .HasColumnType("decimal(12,3)");
                
            builder.Property(ct => ct.SoLuongDaXuat)
                .HasColumnType("decimal(12,3)");
                
            builder.Property(ct => ct.LieuDung)
                .HasMaxLength(200);
                
            builder.Property(ct => ct.TanSuat)
                .HasMaxLength(100);
                
            builder.Property(ct => ct.HuongDan)
                .HasMaxLength(500);
                
            builder.Property(ct => ct.DonGiaKe)
                .HasColumnType("decimal(18,2)");
            
            builder.HasOne(ct => ct.DonThuoc)
                .WithMany(d => d.ChiTietDonThuocs)
                .HasForeignKey(ct => ct.MaDonThuoc)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(ct => ct.Item)
                .WithMany(i => i.ChiTietDonThuocs)
                .HasForeignKey(ct => ct.MaItem)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(ct => ct.MaDonThuoc);
            builder.HasIndex(ct => ct.MaItem);
        }
    }
}
