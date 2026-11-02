using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class CaTrucConfiguration : IEntityTypeConfiguration<CaTruc>
    {
        public void Configure(EntityTypeBuilder<CaTruc> builder)
        {
            builder.ToTable("CaTruc");
            builder.HasKey(ct => ct.Id);

            builder.Property(ct => ct.TenCa)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(ct => ct.ThoiGianBatDau)
                .IsRequired();

            builder.Property(ct => ct.ThoiGianKetThuc)
                .IsRequired();

            builder.Property(ct => ct.HeSo)
                .HasPrecision(5, 2);

            builder.Property(ct => ct.MoTa)
                .HasMaxLength(255);

            builder.HasOne(ct => ct.LoaiCa)
                .WithMany(lc => lc.CaTrucs)
                .HasForeignKey(ct => ct.MaLoaiCa)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(ct => !ct.IsDeleted);
        }
    }
}