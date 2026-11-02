using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Billing;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiTietHoaDonConfiguration : IEntityTypeConfiguration<ChiTietHoaDon>
    {
        public void Configure(EntityTypeBuilder<ChiTietHoaDon> builder)
        {
            builder.ToTable("ChiTietHoaDon");
            builder.HasKey(ct => ct.Id);
            
            builder.Property(ct => ct.LoaiDoiTuong)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(ct => ct.MoTa)
                .IsRequired()
                .HasMaxLength(255);
                
            builder.Property(ct => ct.SoLuong)
                .HasColumnType("decimal(12,3)");
                
            builder.Property(ct => ct.DonGia)
                .HasColumnType("decimal(18,2)");
        
            builder.HasOne(ct => ct.HoaDon)
                .WithMany(h => h.ChiTietHoaDons)
                .HasForeignKey(ct => ct.MaHoaDon)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(ct => ct.MaHoaDon);
            builder.HasIndex(ct => new { ct.LoaiDoiTuong, ct.MaDoiTuong });
        }
    }
}
