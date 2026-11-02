using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class PhanQuyenCoSoConfiguration : IEntityTypeConfiguration<PhanQuyenCoSo>
    {
        public void Configure(EntityTypeBuilder<PhanQuyenCoSo> builder)
        {
            builder.ToTable("PhanQuyenCoSo");
            builder.HasKey(p => p.Id);
            
            builder.HasOne(p => p.NhanVien)
                .WithMany(n => n.PhanQuyenCoSo)
                .HasForeignKey(p => p.MaNhanVien)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(p => p.CoSo)
                .WithMany(c => c.PhanQuyenCoSo)
                .HasForeignKey(p => p.MaCoSo)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(p => p.VaiTro)
                .WithMany(v => v.PhanQuyenCoSo)
                .HasForeignKey(p => p.MaVaiTro)
                .OnDelete(DeleteBehavior.Restrict);
            
        }
    }
}
