using ClinicManagement.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;
public class KyChamCongConfiguration : IEntityTypeConfiguration<KyChamCong>
{
    public void Configure(EntityTypeBuilder<KyChamCong> b)
    {
        b.ToTable("KyChamCong");
        b.HasKey(x => x.Id);
        b.Property(x => x.GhiChu).HasMaxLength(500);
        b.HasIndex(x => new { x.TuNgay, x.DenNgay }).IsUnique();
    }
}
