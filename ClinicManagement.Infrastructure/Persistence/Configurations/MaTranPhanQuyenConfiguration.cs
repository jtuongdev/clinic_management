using ClinicManagement.Domain.System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;

public sealed class MaTranPhanQuyenConfiguration : IEntityTypeConfiguration<MaTranPhanQuyen>
{
    public void Configure(EntityTypeBuilder<MaTranPhanQuyen> builder)
    {
        builder.ToTable("MaTranPhanQuyen");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PhanHe).HasMaxLength(80).IsRequired();
        builder.Property(x => x.HanhDong).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.PhamViDuLieu).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.HasIndex(x => new { x.MaVaiTro, x.PhanHe, x.HanhDong }).IsUnique();
        builder.HasOne<Domain.Identity.VaiTro>()
            .WithMany()
            .HasForeignKey(x => x.MaVaiTro)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
