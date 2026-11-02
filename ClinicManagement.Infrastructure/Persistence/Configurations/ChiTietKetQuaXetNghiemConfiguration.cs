using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Service;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChiTietKetQuaXetNghiemConfiguration : IEntityTypeConfiguration<ChiTietKetQuaXetNghiem>
    {
        public void Configure(EntityTypeBuilder<ChiTietKetQuaXetNghiem> builder)
        {
            builder.ToTable("ChiTietKetQuaXetNghiem");
            builder.HasKey(ct => ct.Id);
            
            builder.Property(ct => ct.TenChiSo)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(ct => ct.GiaTri)
                .HasMaxLength(50);
                
            builder.Property(ct => ct.DonVi)
                .HasMaxLength(50);
                
            builder.Property(ct => ct.KhoangThamChieu)
                .HasMaxLength(100);
            
            builder.HasOne(ct => ct.ChiDinhDichVu)
                .WithMany(cd => cd.ChiTietKetQuaXetNghiems)
                .HasForeignKey(ct => ct.MaChiDinh)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(ct => ct.MaChiDinh);
        }
    }
}
