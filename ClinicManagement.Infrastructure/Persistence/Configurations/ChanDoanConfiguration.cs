using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Examination;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ChanDoanConfiguration : IEntityTypeConfiguration<ChanDoan>
    {
        public void Configure(EntityTypeBuilder<ChanDoan> builder)
        {
            builder.ToTable("ChanDoan");
            builder.HasKey(c => c.Id);
            
            builder.Property(c => c.MaICD)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(c => c.TenChanDoan)
                .IsRequired()
                .HasMaxLength(255);
                
            builder.Property(c => c.GhiChu)
                .HasMaxLength(255);
            
            builder.HasOne(c => c.LuotKham)
                .WithMany(l => l.ChanDoans)
                .HasForeignKey(c => c.MaLuotKham)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(c => c.ICD)
                .WithMany(i => i.ChanDoans)
                .HasPrincipalKey(i => i.MaICD) // Khớp cấu trúc khóa ngoại chuỗi MaICD nối sang trường MaICD của bảng ICD
                .HasForeignKey(c => c.MaICD)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasIndex(c => c.MaLuotKham)
                .IsUnique()
                .HasFilter("[LaChanDoanChinh] = 1 AND [IsDeleted] = 0");

            builder.HasIndex(c => c.MaICD);
        }
    }
}
