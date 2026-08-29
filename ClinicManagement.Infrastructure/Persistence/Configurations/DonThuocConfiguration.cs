using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Prescription;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class DonThuocConfiguration : IEntityTypeConfiguration<DonThuoc>
    {
        public void Configure(EntityTypeBuilder<DonThuoc> builder)
        {
            builder.ToTable("DonThuoc");
            builder.HasKey(d => d.Id);
            
            builder.Property(d => d.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(30);
                
            builder.Property(d => d.GhiChu)
                .HasMaxLength(500);
            
            builder.HasOne(d => d.LuotKham)
                .WithMany(l => l.DonThuocs)
                .HasForeignKey(d => d.MaLuotKham)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(d => d.BacSi)
                .WithMany()
                .HasForeignKey(d => d.MaBacSi)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(d => d.CoSo)
                .WithMany()
                .HasForeignKey(d => d.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(d => d.NguoiCapThuoc)
                .WithMany()
                .HasForeignKey(d => d.MaNguoiCapThuoc)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasMany(d => d.ChiTietDonThuocs)
                .WithOne(ct => ct.DonThuoc)
                .HasForeignKey(ct => ct.MaDonThuoc)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(d => d.MaLuotKham);
            builder.HasIndex(d => d.NgayKe);
            builder.HasIndex(d => d.TrangThai);
        }
    }
}
