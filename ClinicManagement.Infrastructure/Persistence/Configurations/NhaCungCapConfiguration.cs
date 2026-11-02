using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class NhaCungCapConfiguration : IEntityTypeConfiguration<NhaCungCap>
    {
        public void Configure(EntityTypeBuilder<NhaCungCap> builder)
        {
            builder.ToTable("NhaCungCap");
            builder.HasKey(ncc => ncc.Id);
            
            builder.Property(ncc => ncc.Ma)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(ncc => ncc.Ma)
                .IsUnique();
                
            builder.Property(ncc => ncc.Ten)
                .IsRequired()
                .HasMaxLength(255);
                
            builder.Property(ncc => ncc.DiaChi)
                .HasMaxLength(255);
                
            builder.Property(ncc => ncc.DienThoai)
                .HasMaxLength(20);
            builder.HasIndex(ncc => ncc.DienThoai);
                
            builder.Property(ncc => ncc.Email)
                .HasMaxLength(100);
                
            builder.Property(ncc => ncc.MaSoThue)
                .HasMaxLength(20);
                
            builder.Property(ncc => ncc.TrangThai)
                .IsRequired()
                .HasConversion(
                    value => ToDatabaseStatus(value),
                    value => FromDatabaseStatus(value))
                .HasMaxLength(30);
        }

        private static string ToDatabaseStatus(TrangThaiNhaCungCap value)
            => value == TrangThaiNhaCungCap.HoatDong ? "HoatDong" : "NgungHopTac";

        private static TrangThaiNhaCungCap FromDatabaseStatus(string value)
            => value switch
            {
                "ACTIVE" or "HoatDong" => TrangThaiNhaCungCap.HoatDong,
                "INACTIVE" or "NgungHopTac" => TrangThaiNhaCungCap.NgungHopTac,
                _ => throw new InvalidOperationException($"Trạng thái nhà cung cấp không hợp lệ: {value}")
            };
    }
}
