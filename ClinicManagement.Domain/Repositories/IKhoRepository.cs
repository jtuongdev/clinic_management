using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;

namespace ClinicManagement.Domain.Repositories;

public interface IKhoRepository : IUnitOfWork
{
    IQueryable<Item> Items { get; }
    IQueryable<DonViTinhQuyDoi> DonViTinhQuyDois { get; }
    IQueryable<NhaCungCap> NhaCungCaps { get; }
    IQueryable<PhieuNhapKho> PhieuNhapKhos { get; }
    IQueryable<TonKho> TonKhos { get; }
    IQueryable<InventoryTransaction> InventoryTransactions { get; }
    IQueryable<IdempotencyRecord> IdempotencyRecords { get; }
    IQueryable<DonThuoc> DonThuocs { get; }
    IQueryable<ChiTietDonThuoc> ChiTietDonThuocs { get; }
    IQueryable<PhieuXuatKho> PhieuXuatKhos { get; }
    IQueryable<LuotKham> LuotKhams { get; }
    IQueryable<HoaDon> HoaDons { get; }
    IQueryable<Stocktake> Stocktakes { get; }
    IQueryable<StocktakeCount> StocktakeCounts { get; }

    void Add<TEntity>(TEntity entity) where TEntity : class;

    Task<IKhoTransaction> BeginTransactionAsync(
        CancellationToken cancellationToken = default);
}

public interface IKhoTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken = default);
}
