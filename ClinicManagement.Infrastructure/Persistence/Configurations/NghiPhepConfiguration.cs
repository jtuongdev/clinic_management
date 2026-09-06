using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class NghiPhepConfiguration : IEntityTypeConfiguration<NghiPhep>
    {
        public void Configure(EntityTypeBuilder<NghiPhep> builder)
        {
            builder.ToTable("NghiPhep");
            builder.HasKey(np => np.Id);

            builder.Property(np => np.TuNgay)
                .IsRequired();

            builder.Property(np => np.DenNgay)
                .IsRequired();

            builder.Property(np => np.LoaiNghi)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(30);

            builder.Property(np => np.LyDo)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(np => np.TrangThai)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(30);

            builder.Property(np => np.GhiChu)
                .HasMaxLength(500);

            builder.HasOne(np => np.NhanVien)
                .WithMany()
                .HasForeignKey(np => np.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(np => np.NguoiDuyetNavigation)
                .WithMany()
                .HasForeignKey(np => np.NguoiDuyet)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(np => new { np.MaNhanVien, np.TrangThai });
            builder.HasIndex(np => new { np.TuNgay, np.DenNgay });

            builder.HasQueryFilter(np => !np.IsDeleted);
        }
    }
}