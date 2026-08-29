using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Service;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiDinhDichVuConfiguration : IEntityTypeConfiguration<ChiDinhDichVu>
    {
        public void Configure(EntityTypeBuilder<ChiDinhDichVu> builder)
        {
            builder.ToTable("ChiDinhDichVu");
            builder.HasKey(cd => cd.Id);
            
            builder.Property(cd => cd.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            builder.Property(cd => cd.KetLuan)
                .IsRequired(false);
                
            builder.Property(cd => cd.UrlKetQua)
                .HasMaxLength(500);
            
            builder.HasOne(cd => cd.LuotKham)
                .WithMany(l => l.ChiDinhDichVus)
                .HasForeignKey(cd => cd.MaLuotKham)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(cd => cd.BacSiChiDinh)
                .WithMany()
                .HasForeignKey(cd => cd.MaBacSiChiDinh)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(cd => cd.DanhMucDichVu)
                .WithMany(d => d.ChiDinhDichVus)
                .HasForeignKey(cd => cd.MaDanhMuc)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(cd => cd.NguoiThucHien)
                .WithMany()
                .HasForeignKey(cd => cd.MaNguoiThucHien)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasMany(cd => cd.ChiTietKetQuaXetNghiems)
                .WithOne(ct => ct.ChiDinhDichVu)
                .HasForeignKey(ct => ct.MaChiDinh)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(cd => cd.MaLuotKham);
            builder.HasIndex(cd => cd.NgayChiDinh);
            builder.HasIndex(cd => cd.TrangThai);
        }
    }
}
