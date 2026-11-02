using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class LichLamViecConfiguration : IEntityTypeConfiguration<LichLamViec>
    {
        public void Configure(EntityTypeBuilder<LichLamViec> builder)
        {
            builder.ToTable("LichLamViec");
            builder.HasKey(llv => llv.Id);

            builder.Property(llv => llv.NgayLam)
                .IsRequired();

            builder.Property(llv => llv.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(llv => llv.NhanVien)
                .WithMany()
                .HasForeignKey(llv => llv.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(llv => llv.Khoa)
                .WithMany()
                .HasForeignKey(llv => llv.MaKhoa)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(llv => llv.CaTruc)
                .WithMany(ct => ct.LichLamViecs)
                .HasForeignKey(llv => llv.MaCaTruc)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(llv => llv.PhongKham)
                .WithMany()
                .HasForeignKey(llv => llv.MaPhongKham)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(llv => llv.LichLamViecCoDinh)
                .WithMany(fixedSchedule => fixedSchedule.LichLamViecs)
                .HasForeignKey(llv => llv.MaLichLamViecCoDinh)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(llv => llv.NguonLich)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();
            builder.Property(llv => llv.TrangThai)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            builder.HasIndex(llv => new { llv.MaNhanVien, llv.MaCaTruc, llv.NgayLam })
                .HasDatabaseName("IX_LichLamViec_MaNhanVien_MaCaTruc_NgayLam")
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
            builder.HasIndex(llv => new { llv.MaKhoa, llv.NgayLam });

            builder.HasQueryFilter(llv => !llv.IsDeleted);
        }
    }
}