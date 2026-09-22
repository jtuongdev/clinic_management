using ClinicManagement.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class LichLamViecCoDinhConfiguration : IEntityTypeConfiguration<LichLamViecCoDinh>
    {
        public void Configure(EntityTypeBuilder<LichLamViecCoDinh> builder)
        {
            builder.ToTable("LichLamViecCoDinh");
            builder.HasKey(item => item.Id);
            builder.Property(item => item.GhiChu).HasMaxLength(500);
            builder.Property(item => item.IsActive).HasDefaultValue(true);
            builder.HasOne(item => item.NhanVien).WithMany().HasForeignKey(item => item.MaNhanVien).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(item => item.Khoa).WithMany().HasForeignKey(item => item.MaKhoa).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(item => item.CaTruc).WithMany().HasForeignKey(item => item.MaCaTruc).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(item => item.PhongKham).WithMany().HasForeignKey(item => item.MaPhongKham).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(x => new { x.MaNhanVien, x.ThuTrongTuan, x.MaCaTruc })
                .HasDatabaseName("IX_LichCoDinh_NhanVien_Thu_Ca")
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
            builder.HasQueryFilter(item => !item.IsDeleted);
        }
    }
}
