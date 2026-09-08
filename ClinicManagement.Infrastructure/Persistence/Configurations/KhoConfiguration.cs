using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class KhoConfiguration : IEntityTypeConfiguration<Kho>
    {
        public void Configure(EntityTypeBuilder<Kho> builder)
        {
            builder.ToTable("Kho");
            builder.HasKey(k => k.Id);
            
            builder.Property(k => k.TenKho)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(k => k.LoaiKho)
                .HasConversion<string>()
                .HasMaxLength(20);
                
            builder.Property(k => k.DiaChi)
                .HasMaxLength(255);
                
            builder.Property(k => k.TrangThai)
                .HasConversion(
                    value => ToDatabaseStatus(value),
                    value => FromDatabaseStatus(value))
                .HasMaxLength(20);
            
            builder.HasOne(k => k.CoSo)
                .WithMany()
                .HasForeignKey(k => k.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(k => k.Khoa)
                .WithMany()
                .HasForeignKey(k => k.MaKhoa)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasOne(k => k.NguoiPhuTrach)
                .WithMany()
                .HasForeignKey(k => k.MaNguoiPhuTrach)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasMany(k => k.TonKhos)
                .WithOne(tk => tk.Kho)
                .HasForeignKey(tk => tk.MaKho)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(k => k.PhieuNhapKhos)
                .WithOne(pn => pn.Kho)
                .HasForeignKey(pn => pn.MaKho)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(k => k.PhieuXuatKhos)
                .WithOne(px => px.KhoXuat)
                .HasForeignKey(px => px.MaKhoXuat)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(k => k.MaCoSo);
            builder.HasIndex(k => k.TrangThai);
        }

        private static string ToDatabaseStatus(TrangThaiKho value)
            => value switch
            {
            TrangThaiKho.HoatDong => "HoatDong",
            TrangThaiKho.TamNgung => "TamNgung",
            TrangThaiKho.DongCua => "DongCua",
            _ => throw new InvalidOperationException($"Trạng thái kho không hợp lệ: {value}")
            };

        private static TrangThaiKho FromDatabaseStatus(string value)
            => value switch
            {
            "ACTIVE" or "HoatDong" => TrangThaiKho.HoatDong,
            "INACTIVE" or "TamNgung" => TrangThaiKho.TamNgung,
            "CLOSED" or "DongCua" => TrangThaiKho.DongCua,
            _ => throw new InvalidOperationException($"Trạng thái kho không hợp lệ: {value}")
            };
    }
}
