using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Patient;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class TienSuBenhConfiguration : IEntityTypeConfiguration<TienSuBenh>
    {
        public void Configure(EntityTypeBuilder<TienSuBenh> builder)
        {
            builder.ToTable("TienSuBenh");
            builder.HasKey(ts => ts.Id);
    
            builder.Property(ts => ts.LoaiTienSu)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(ts => ts.Ten)
                .IsRequired()
                .HasMaxLength(200);
                
            builder.Property(ts => ts.GhiChu)
                .HasMaxLength(500);
        
            builder.Property(ts => ts.NgayGhiNhan)
                .HasDefaultValueSql("GETDATE()");
            
            builder.HasOne(ts => ts.BenhNhan)
                .WithMany(b => b.TienSuBenhs)
                .HasForeignKey(ts => ts.MaBenhNhan)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(ts => ts.MaBenhNhan);
        }
    }
}