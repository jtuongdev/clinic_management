using ClinicManagement.Domain.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;

public class StocktakeConfiguration : IEntityTypeConfiguration<Stocktake>
{
    public void Configure(EntityTypeBuilder<Stocktake> builder)
    {
        builder.ToTable("Stocktake");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ReferenceCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Note).HasMaxLength(500);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(x => x.ReferenceCode).IsUnique();
        builder.HasMany(x => x.Counts).WithOne(x => x.Stocktake).HasForeignKey(x => x.StocktakeId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class StocktakeCountConfiguration : IEntityTypeConfiguration<StocktakeCount>
{
    public void Configure(EntityTypeBuilder<StocktakeCount> builder)
    {
        builder.ToTable("StocktakeCount");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.SystemQuantity).HasColumnType("decimal(12,3)");
        builder.Property(x => x.ActualQuantity).HasColumnType("decimal(12,3)");
        builder.Property(x => x.Reason).HasMaxLength(500);
        builder.HasOne(x => x.TonKho).WithMany().HasForeignKey(x => x.MaTonKho).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => new { x.StocktakeId, x.MaTonKho }).IsUnique();
    }
}
