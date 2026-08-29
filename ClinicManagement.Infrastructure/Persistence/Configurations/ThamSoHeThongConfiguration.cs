using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ThamSoHeThongConfiguration : IEntityTypeConfiguration<ThamSoHeThong>
    {
        public void Configure(EntityTypeBuilder<ThamSoHeThong> builder)
        {
            builder.ToTable("ThamSoHeThong");
            builder.HasKey(ts => ts.Id);
            
            builder.Property(ts => ts.TenThamSo)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(ts => ts.GiaTri)
                .IsRequired()
                .HasMaxLength(500);
                
            builder.Property(ts => ts.MoTa)
                .HasMaxLength(255);
            
            builder.HasOne(ts => ts.CoSo)
                .WithMany()
                .HasForeignKey(ts => ts.MaCoSo)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasIndex(ts => ts.TenThamSo)
                .IsUnique()
                .HasFilter("[MaCoSo] IS NULL AND [IsDeleted] = 0");
                
            builder.HasIndex(ts => new { ts.MaCoSo, ts.TenThamSo })
                .IsUnique()
                .HasFilter("[MaCoSo] IS NOT NULL AND [IsDeleted] = 0");
        }
    }
}
