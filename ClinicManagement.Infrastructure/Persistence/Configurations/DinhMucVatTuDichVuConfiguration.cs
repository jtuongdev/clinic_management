using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Service;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class DinhMucVatTuDichVuConfiguration : IEntityTypeConfiguration<DinhMucVatTuDichVu>
    {
        public void Configure(EntityTypeBuilder<DinhMucVatTuDichVu> builder)
        {
            builder.ToTable("DinhMucVatTuDichVu");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SoLuong)
                .HasColumnType("decimal(12,3)")
                .IsRequired();

            builder.Property(x => x.DonViTinh)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.GhiChu)
                .HasMaxLength(255);

            builder.HasOne(x => x.DanhMucDichVu)
                .WithMany(d => d.DinhMucVatTus)
                .HasForeignKey(x => x.MaDanhMucDichVu)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Item)
                .WithMany()
                .HasForeignKey(x => x.MaItem)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.MaDanhMucDichVu, x.MaItem }).IsUnique();
        }
    }
}
