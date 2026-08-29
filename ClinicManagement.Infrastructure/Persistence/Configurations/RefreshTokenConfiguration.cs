using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshToken");
            builder.HasKey(rt => rt.Id);
            builder.Property(rt => rt.Token)
                .IsRequired()
                .HasMaxLength(500);
            builder.HasIndex(rt => rt.Token)
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