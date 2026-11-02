using ClinicManagement.Domain.Payroll;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;

public class CauHinhHoaHongLoaiDichVuConfiguration : IEntityTypeConfiguration<CauHinhHoaHongLoaiDichVu>
{
    public void Configure(EntityTypeBuilder<CauHinhHoaHongLoaiDichVu> builder)
    {
        builder.ToTable("CauHinhHoaHongLoaiDichVu");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.LoaiDichVu)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.LoaiDichVu)
            .IsUnique();

        builder.Property(x => x.TyLeHoaHong)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.GhiChu)
            .HasMaxLength(255);
    }
}
