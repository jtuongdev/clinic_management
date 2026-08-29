using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class TonKhoConfiguration : IEntityTypeConfiguration<TonKho>
    {
        public void Configure(EntityTypeBuilder<TonKho> builder)
        {
            builder.ToTable("TonKho");
            builder.HasKey(tk => tk.Id);
            
            builder.Property(tk => tk.SoLuongTon)
                .HasColumnType("decimal(12,3)");
            
            builder.HasOne(tk => tk.Kho)
                .WithMany(k => k.TonKhos)
                .HasForeignKey(tk => tk.MaKho)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(tk => tk.Item)
                .WithMany(i => i.TonKhos)
                .HasForeignKey(tk => tk.MaItem)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(tk => tk.ChiTietNhapKho)
                .WithOne(ct => ct.TonKho)
                .HasForeignKey<TonKho>(tk => tk.MaChiTietNhap)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasIndex(tk => new { tk.MaKho, tk.MaItem });
            builder.HasIndex(tk => tk.MaChiTietNhap).IsUnique();
        }
    }
}
