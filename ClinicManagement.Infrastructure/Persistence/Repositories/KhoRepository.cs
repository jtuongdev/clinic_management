using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Service;
using Microsoft.EntityFrameworkCore.Storage;

namespace ClinicManagement.Infrastructure.Persistence.Repositories;

public sealed class KhoRepository(ClinicDbContext context) : IKhoRepository
{
    public IQueryable<Item> Items => context.Items;
    public IQueryable<DonViTinhQuyDoi> DonViTinhQuyDois => context.DonViTinhQuyDois;
    public IQueryable<NhaCungCap> NhaCungCaps => context.NhaCungCaps;
    public IQueryable<Kho> Khos => context.Khos;
    public IQueryable<DonDatHang> DonDatHangs => context.DonDatHangs;
    public IQueryable<ChiTietDonDatHang> ChiTietDonDatHangs => context.ChiTietDonDatHangs;
    public IQueryable<PhieuNhapKho> PhieuNhapKhos => context.PhieuNhapKhos;
    public IQueryable<TonKho> TonKhos => context.TonKhos;
    public IQueryable<InventoryTransaction> InventoryTransactions => context.InventoryTransactions;
    public IQueryable<IdempotencyRecord> IdempotencyRecords => context.IdempotencyRecords;
    public IQueryable<DonThuoc> DonThuocs => context.DonThuocs;
    public IQueryable<ChiTietDonThuoc> ChiTietDonThuocs => context.ChiTietDonThuocs;
    public IQueryable<PhieuXuatKho> PhieuXuatKhos => context.PhieuXuatKhos;
    public IQueryable<LuotKham> LuotKhams => context.LuotKhams;
    public IQueryable<HoaDon> HoaDons => context.HoaDons;
    public IQueryable<Stocktake> Stocktakes => context.Stocktakes;
    public IQueryable<StocktakeCount> StocktakeCounts => context.StocktakeCounts;
    public IQueryable<DinhMucVatTuDichVu> DinhMucVatTuDichVus => context.DinhMucVatTuDichVus;
    public IQueryable<Khoa> Khoas => context.Khoas;
    public IQueryable<ChiDinhDichVu> ChiDinhDichVus => context.ChiDinhDichVus;

    public void Add<TEntity>(TEntity entity) where TEntity : class
        => context.Set<TEntity>().Add(entity);

    public void Remove<TEntity>(TEntity entity) where TEntity : class
        => context.Set<TEntity>().Remove(entity);

    public void RemoveRange<TEntity>(IEnumerable<TEntity> entities) where TEntity : class
        => context.Set<TEntity>().RemoveRange(entities);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => context.SaveChangesAsync(cancellationToken);

    public Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
        => context.SaveEntitiesAsync(cancellationToken);

    public async Task<IKhoTransaction> BeginTransactionAsync(
        CancellationToken cancellationToken = default)
        => new KhoTransaction(await context.Database.BeginTransactionAsync(cancellationToken));

    private sealed class KhoTransaction(IDbContextTransaction transaction) : IKhoTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken = default)
            => transaction.CommitAsync(cancellationToken);

        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
