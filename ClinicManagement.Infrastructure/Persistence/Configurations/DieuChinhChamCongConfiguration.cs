using ClinicManagement.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;
public class DieuChinhChamCongConfiguration : IEntityTypeConfiguration<DieuChinhChamCong>
{
    public void Configure(EntityTypeBuilder<DieuChinhChamCong> b)
    {
        b.ToTable("DieuChinhChamCong");
        b.HasKey(x => x.Id);
        b.Property(x => x.TrangThai).HasConversion<string>().HasMaxLength(20).IsRequired();
        b.Property(x => x.LyDo).HasMaxLength(500).IsRequired();
        b.Property(x => x.GhiChuDuyet).HasMaxLength(500);
        b.HasOne(x => x.ChamCong).WithMany().HasForeignKey(x => x.MaChamCong).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.NhanVien).WithMany().HasForeignKey(x => x.MaNhanVien).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.MaChamCong, x.TrangThai });
    }
}
