using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChamCongConfiguration : IEntityTypeConfiguration<ChamCong>
    {
        public void Configure(EntityTypeBuilder<ChamCong> builder)
        {
            builder.ToTable("ChamCong");
            builder.HasKey(cc => cc.Id);

            builder.Property(cc => cc.NgayChamCong)
                .IsRequired();

            builder.Property(cc => cc.TrangThai)
                .IsRequired()
                .HasMaxLength(30);

            builder.Property(cc => cc.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(cc => cc.NhanVien)
                .WithMany()
                .HasForeignKey(cc => cc.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(cc => new { cc.MaNhanVien, cc.NgayChamCong })
                .IsUnique();

            builder.HasQueryFilter(cc => !cc.IsDeleted);
        }
    }
}