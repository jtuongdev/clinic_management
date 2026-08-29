using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class BaoHiemConfiguration : IEntityTypeConfiguration<BaoHiem>
    {
        public void Configure(EntityTypeBuilder<BaoHiem> builder)
        {
            builder.ToTable("BaoHiem");
            builder.HasKey(bh => bh.Id);
            
            builder.Property(bh => bh.LoaiBaoHiem)
                .HasConversion<string>()
                .HasMaxLength(50);
                
            builder.Property(bh => bh.TenNhaCungCap)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(bh => bh.SoThe)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(bh => bh.SoThe)
                .IsUnique();
            builder.Property(bh => bh.MucHuong)
                .HasColumnType("decimal(5,2)");
            
            builder.HasOne(bh => bh.BenhNhan)
                .WithMany(b => b.BaoHiems)
                .HasForeignKey(bh => bh.MaBenhNhan)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
