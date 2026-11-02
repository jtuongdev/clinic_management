using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class NhanVienKhoaConfiguration : IEntityTypeConfiguration<NhanVienKhoa>
    {
        public void Configure(EntityTypeBuilder<NhanVienKhoa> builder)
        {
            builder.ToTable("NhanVienKhoa");
            builder.HasKey(nk => nk.Id);
            
            builder.HasOne(nk => nk.NhanVien)
                .WithMany(n => n.NhanVienKhoa)
                .HasForeignKey(nk => nk.MaNhanVien)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(nk => nk.Khoa)
                .WithMany(k => k.NhanVienKhoa)
                .HasForeignKey(nk => nk.MaKhoa)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
