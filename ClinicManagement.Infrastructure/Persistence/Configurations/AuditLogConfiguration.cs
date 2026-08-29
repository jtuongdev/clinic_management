using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.ToTable("AuditLog");
            builder.HasKey(al => al.Id);
            
            builder.Property(al => al.Bang)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(al => al.HanhDong)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.Property(al => al.IpAddress)
                .HasMaxLength(45);
            
            builder.HasOne(al => al.NguoiThucHienNavigation)
                .WithMany()
                .HasForeignKey(al => al.NguoiThucHien)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.HasIndex(al => new { al.Bang, al.MaBangGhi });
            builder.HasIndex(al => al.ThoiGian);
        }
    }
}
