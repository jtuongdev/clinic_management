using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Examination;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class SinhHieuConfiguration : IEntityTypeConfiguration<SinhHieu>
    {
        public void Configure(EntityTypeBuilder<SinhHieu> builder)
        {
            builder.ToTable("SinhHieu");
            builder.HasKey(s => s.Id);

            builder.Property(s => s.NhietDo)
                .HasColumnType("decimal(4,1)");

            builder.Property(s => s.CanNang)
                .HasColumnType("decimal(5,2)");

            builder.Property(s => s.ChieuCao)
                .HasColumnType("decimal(5,2)");

            builder.HasOne(s => s.LuotKham)
                .WithMany(l => l.SinhHieus)
                .HasForeignKey(s => s.MaLuotKham)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(s => s.MaLuotKham);
        }
    }
}
