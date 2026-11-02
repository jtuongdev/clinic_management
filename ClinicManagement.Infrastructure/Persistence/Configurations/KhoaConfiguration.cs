using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Facility;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class KhoaConfiguration : IEntityTypeConfiguration<Khoa>
    {
        public void Configure(EntityTypeBuilder<Khoa> builder)
        {
            builder.ToTable("Khoa");
            builder.HasKey(k => k.Id);
            
            builder.Property(k => k.Ma)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.Property(k => k.Ten)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.HasIndex(k => new { k.MaCoSo, k.Ma })
                .IsUnique();
            
            builder.HasOne(k => k.CoSo)
                .WithMany(c => c.Khoas)
                .HasForeignKey(k => k.MaCoSo)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(k => k.KhoaCha)
                .WithMany(k => k.KhoaCon)
                .HasForeignKey(k => k.MaKhoaCha)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
