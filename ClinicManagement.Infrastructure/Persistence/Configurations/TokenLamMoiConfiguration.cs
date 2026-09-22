using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class TokenLamMoiConfiguration : IEntityTypeConfiguration<TokenLamMoi>
    {
        public void Configure(EntityTypeBuilder<TokenLamMoi> builder)
        {
            builder.ToTable("TokenLamMoi");
            builder.HasKey(rt => rt.Id);
            builder.Property(rt => rt.MaToken)
                .IsRequired()
                .HasMaxLength(500);
            builder.HasIndex(rt => rt.MaToken)
                .IsUnique();
            
            builder.HasOne(rt => rt.NhanVien)
                .WithMany()
                .HasForeignKey(rt => rt.MaNhanVien)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(rt => rt.BenhNhan)
                .WithMany()
                .HasForeignKey(rt => rt.MaBenhNhan)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasIndex(rt => rt.MaNhanVien);
            builder.HasIndex(rt => rt.MaBenhNhan);
        }
    }
}
