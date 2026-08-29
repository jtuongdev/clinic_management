using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Identity;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class VaiTroQuyenConfiguration : IEntityTypeConfiguration<VaiTroQuyen>
    {
        public void Configure(EntityTypeBuilder<VaiTroQuyen> builder)
        {
            builder.ToTable("VaiTroQuyen");
            builder.HasKey(vq => vq.Id); 

            builder.HasIndex(vq => new { vq.MaVaiTro, vq.MaQuyen })
                .IsUnique(); 
            
            builder.HasOne(vq => vq.VaiTro)
                .WithMany(v => v.VaiTroQuyens)
                .HasForeignKey(vq => vq.MaVaiTro)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(vq => vq.Quyen)
                .WithMany(q => q.VaiTroQuyens)
                .HasForeignKey(vq => vq.MaQuyen)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
