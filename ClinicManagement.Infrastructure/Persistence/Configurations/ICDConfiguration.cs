using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Examination;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ICDConfiguration : IEntityTypeConfiguration<ICD>
    {
        public void Configure(EntityTypeBuilder<ICD> builder)
        {
            builder.ToTable("ICD");
            builder.HasKey(i => i.Id); 

            builder.Property(i => i.MaICD)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.HasIndex(i => i.MaICD)
                .IsUnique();

            builder.Property(i => i.TenICD)
                .IsRequired()
                .HasMaxLength(255);
                
            builder.Property(i => i.Chuong)
                .HasMaxLength(100);
        }
    }
}
