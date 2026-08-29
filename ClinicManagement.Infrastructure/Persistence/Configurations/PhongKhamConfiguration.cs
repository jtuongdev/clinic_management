using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Examination;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class PhongKhamConfiguration : IEntityTypeConfiguration<PhongKham>
    {
        public void Configure(EntityTypeBuilder<PhongKham> builder)
        {
            builder.ToTable("PhongKham");
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Ma)
                .IsRequired()
                .HasMaxLength(20);
            builder.HasIndex(p => p.Ma).IsUnique();

            builder.Property(p => p.Ten)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.TrangThai)
                .IsRequired()
                .HasMaxLength(20);

            builder.HasOne(p => p.Khoa)
                .WithMany(k => k.PhongKhams)
                .HasForeignKey(p => p.MaKhoa)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.LuotKhams)
                .WithOne(l => l.PhongKham)
                .HasForeignKey(l => l.MaPhongKham)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasQueryFilter(p => !p.IsDeleted);
        }
    }
}