using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class NhanVienVaiTroConfiguration : IEntityTypeConfiguration<NhanVienVaiTro>
    {
        public void Configure(EntityTypeBuilder<NhanVienVaiTro> builder)
        {
            builder.ToTable("NhanVienVaiTro");
            builder.HasKey(nv => nv.Id);
            
            builder.HasOne(nv => nv.NhanVien)
                .WithMany(n => n.NhanVienVaiTro)
                .HasForeignKey(nv => nv.MaNhanVien)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(nv => nv.VaiTro)
                .WithMany(v => v.NhanVienVaiTro)
                .HasForeignKey(nv => nv.MaVaiTro)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
