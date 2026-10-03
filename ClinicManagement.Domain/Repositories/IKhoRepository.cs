using ClinicManagement.Domain.Billing;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using ClinicManagement.Domain.Service;

namespace ClinicManagement.Domain.Repositories;

public interface IKhoRepository : IUnitOfWork
{
    IQueryable<Item> Items { get; }
    IQueryable<DonViTinhQuyDoi> DonViTinhQuyDois { get; }
    IQueryable<NhaCungCap> NhaCungCaps { get; }
    IQueryable<Kho> Khos { get; }
    IQueryable<DonDatHang> DonDatHangs { get; }
    IQueryable<ChiTietDonDatHang> ChiTietDonDatHangs { get; }
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
    IQueryable<DinhMucVatTuDichVu> DinhMucVatTuDichVus { get; }
    IQueryable<Khoa> Khoas { get; }
    IQueryable<ChiDinhDichVu> ChiDinhDichVus { get; }

    void Add<TEntity>(TEntity entity) where TEntity : class;
    void Remove<TEntity>(TEntity entity) where TEntity : class;
    void RemoveRange<TEntity>(IEnumerable<TEntity> entities) where TEntity : class;

    Task<IKhoTransaction> BeginTransactionAsync(
        CancellationToken cancellationToken = default);
}

public interface IKhoTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken = default);
}
