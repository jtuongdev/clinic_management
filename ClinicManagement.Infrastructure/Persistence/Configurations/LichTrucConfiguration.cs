using ClinicManagement.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class LichTrucConfiguration : IEntityTypeConfiguration<LichTruc>
    {
        public void Configure(EntityTypeBuilder<LichTruc> builder)
        {
            builder.ToTable("LichTruc");
            builder.HasKey(lt => lt.Id);

            builder.Property(lt => lt.NgayTruc).IsRequired();
            builder.Property(lt => lt.GhiChu).HasMaxLength(500);

            builder.HasOne(lt => lt.NhanVien)
                .WithMany()
                .HasForeignKey(lt => lt.MaNhanVien)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(lt => lt.CaTruc)
                .WithMany(ct => ct.LichTrucs)
                .HasForeignKey(lt => lt.MaCaTruc)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(lt => new { lt.MaNhanVien, lt.MaCaTruc, lt.NgayTruc })
                .IsUnique();
            builder.HasQueryFilter(lt => !lt.IsDeleted);
        }
    }
}