using ClinicManagement.Domain.Inventory;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClinicManagement.Infrastructure.Persistence.Configurations;

public class IdempotencyRecordConfiguration : IEntityTypeConfiguration<IdempotencyRecord>
{
    public void Configure(EntityTypeBuilder<IdempotencyRecord> builder)
    {
        builder.ToTable("IdempotencyRecord");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Key).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Operation).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ResponseJson).IsRequired();
        builder.HasIndex(x => new { x.Key, x.Operation }).IsUnique();
    }
}
