using ClinicManagement.Domain.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;

public class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
{
    public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
    {
        builder.ToTable("InventoryTransaction");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.LoaiGiaoDich).HasConversion<string>().HasMaxLength(30);
        builder.Property(x => x.SoLo).HasMaxLength(50);
        builder.Property(x => x.MaChungTu).IsRequired().HasMaxLength(50);
        builder.Property(x => x.IdempotencyKey).HasMaxLength(100);
        builder.Property(x => x.GhiChu).HasMaxLength(500);
        builder.Property(x => x.SoLuongTruoc).HasColumnType("decimal(12,3)");
        builder.Property(x => x.SoLuongThayDoi).HasColumnType("decimal(12,3)");
        builder.Property(x => x.SoLuongSau).HasColumnType("decimal(12,3)");
        builder.HasIndex(x => new { x.MaItem, x.CreatedAt });
        builder.HasIndex(x => x.IdempotencyKey).HasFilter("[IdempotencyKey] <> ''");
        builder.HasOne(x => x.Item).WithMany().HasForeignKey(x => x.MaItem).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.TonKho).WithMany().HasForeignKey(x => x.MaTonKho).OnDelete(DeleteBehavior.Restrict);
    }
}
