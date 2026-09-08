using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Infrastructure.Persistence.Configurations
{
    public class ItemConfiguration : IEntityTypeConfiguration<Item>
    {
        public void Configure(EntityTypeBuilder<Item> builder)
        {
            builder.ToTable("Item");
            builder.HasKey(i => i.Id);
            
            builder.Property(i => i.LoaiItem)
                .HasConversion(
                    v => v.ToString(),
                    s => s.Equals("VatTu", StringComparison.OrdinalIgnoreCase) ||
                         s.Equals("VAT_TU", StringComparison.OrdinalIgnoreCase) ||
                         s.Equals("VA_TU", StringComparison.OrdinalIgnoreCase)
                            ? LoaiItem.VA_TU
                            : LoaiItem.THUOC)
                .HasMaxLength(20);
                
            builder.Property(i => i.Ma)
                .IsRequired()
                .HasMaxLength(50);
            builder.HasIndex(i => i.Ma)
                .IsUnique();
                
            builder.Property(i => i.Ten)
                .IsRequired()
                .HasMaxLength(255);
            builder.HasIndex(i => i.Ten);

            builder.Property(i => i.TenGoc)
                .HasMaxLength(255);
                
            builder.Property(i => i.DangBaoChe)
                .HasMaxLength(100);
                
            builder.Property(i => i.HamLuong)
                .HasMaxLength(100);
                
            builder.Property(i => i.DonViTinhCoBan)
                .IsRequired()
                .HasMaxLength(20);
                
            builder.Property(i => i.GiaBanLe)
                .HasColumnType("decimal(18,2)");
            builder.Property(i => i.TonToiThieu)
                .HasColumnType("decimal(12,3)");
            
            builder.HasMany(i => i.DonViTinhQuyDois)
                .WithOne(dv => dv.Item)
                .HasForeignKey(dv => dv.MaItem)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(i => i.TonKhos)
                .WithOne(tk => tk.Item)
                .HasForeignKey(tk => tk.MaItem)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(i => i.ChiTietNhapKhos)
                .WithOne(ct => ct.Item)
                .HasForeignKey(ct => ct.MaItem)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(i => i.ChiTietDonThuocs)
                .WithOne(ct => ct.Item)
                .HasForeignKey(ct => ct.MaItem)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
