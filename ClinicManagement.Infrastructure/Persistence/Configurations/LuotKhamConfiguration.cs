using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class LuotKhamConfiguration : IEntityTypeConfiguration<LuotKham>
    {
        public void Configure(EntityTypeBuilder<LuotKham> builder)
        {
            builder.ToTable("LuotKham");
            builder.HasKey(lk => lk.Id);

            builder.Property(lk => lk.HinhThucDieuTri)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(lk => lk.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(20);

            builder.Property(lk => lk.LyDoKham)
                .HasMaxLength(500);

            builder.HasOne(lk => lk.PhongKham)
                .WithMany(p => p.LuotKhams)
                .HasForeignKey(lk => lk.MaPhongKham)
                .OnDelete(DeleteBehavior.SetNull);
                
            builder.HasOne(lk => lk.BenhNhan)
                .WithMany(b => b.LuotKhams)
                .HasForeignKey(lk => lk.MaBenhNhan)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(lk => lk.BacSi)
                .WithMany()
                .HasForeignKey(lk => lk.MaBacSi)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(lk => lk.LichHen)
                .WithMany()
                .HasForeignKey(lk => lk.MaLichHen)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(lk => lk.CoSo)
                .WithMany()
                .HasForeignKey(lk => lk.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(lk => lk.Khoa)
                .WithMany(k => k.LuotKhams) 
                .HasForeignKey(lk => lk.MaKhoa)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(lk => lk.ChanDoans)
                .WithOne(c => c.LuotKham)
                .HasForeignKey(c => c.MaLuotKham)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(lk => lk.SinhHieus)
                .WithOne(s => s.LuotKham)
                .HasForeignKey(s => s.MaLuotKham)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(lk => lk.ChiDinhDichVus)
                .WithOne(cd => cd.LuotKham)
                .HasForeignKey(cd => cd.MaLuotKham)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(lk => lk.DonThuocs)
                .WithOne(d => d.LuotKham)
                .HasForeignKey(d => d.MaLuotKham)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(lk => lk.HoaDons)
                .WithOne(h => h.LuotKham)
                .HasForeignKey(h => h.MaLuotKham)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(lk => new { lk.MaBenhNhan, lk.NgayKham })
                .HasFilter("[IsDeleted] = 0");
            builder.HasIndex(lk => new { lk.MaBacSi, lk.NgayKham })
                .HasFilter("[IsDeleted] = 0");
            builder.HasIndex(lk => lk.TrangThai)
                .HasFilter("[IsDeleted] = 0");
            builder.HasIndex(lk => lk.NgayKham)
                .HasFilter("[IsDeleted] = 0");
            builder.HasIndex(lk => lk.MaPhongKham)
                .HasFilter("[IsDeleted] = 0");
        }
    }
}