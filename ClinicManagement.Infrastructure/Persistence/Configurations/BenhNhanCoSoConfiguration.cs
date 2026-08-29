using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class BenhNhanCoSoConfiguration : IEntityTypeConfiguration<BenhNhanCoSo>
    {
        public void Configure(EntityTypeBuilder<BenhNhanCoSo> builder)
        {
            builder.ToTable("BenhNhanCoSo");
            builder.HasKey(bc => bc.Id);
            
            builder.Property(bc => bc.MaBenhNhanNoiBo)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.HasIndex(bc => new { bc.MaCoSo, bc.MaBenhNhanNoiBo })
                .IsUnique();
            
            builder.HasOne(bc => bc.BenhNhan)
                .WithMany(b => b.BenhNhanCoSo)
                .HasForeignKey(bc => bc.MaBenhNhan)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(bc => bc.CoSo)
                .WithMany()
                .HasForeignKey(bc => bc.MaCoSo)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
