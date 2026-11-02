namespace ClinicManagement.Domain.Inventory.Services;

/// <summary>
/// Domain Service: phân bổ lô theo thuật toán FEFO (First-Expired, First-Out).
/// Inject vào bất kỳ Command Handler nào cần trừ tồn kho hoặc xem trước phân bổ.
/// </summary>
public sealed class FefoAllocationService
{
    /// <summary>Kết quả phân bổ cho một lô tồn kho.</summary>
    public sealed record AllocationLine(
        TonKho Batch,
        decimal QuantityToTake,
        decimal QuantityBefore);

    /// <summary>
    /// Phân bổ và TRỪ thực tế tồn kho theo FEFO.
    /// Gọi <see cref="TonKho.SubtractQuantity"/> trực tiếp trên từng lô.
    /// </summary>
    /// <param name="fefoSortedBatches">Danh sách lô đã được sắp xếp tăng dần theo HanSuDung.</param>
    /// <param name="need">Tổng số lượng cần lấy.</param>
    /// <returns>Danh sách lô đã được phân bổ và đã trừ kho.</returns>
    public IReadOnlyList<AllocationLine> Allocate(IEnumerable<TonKho> fefoSortedBatches, decimal need)
    {
        var result = new List<AllocationLine>();
        foreach (var batch in fefoSortedBatches)
        {
            if (need <= 0) break;
            var take = Math.Min(need, batch.SoLuongTon);
            var before = batch.SoLuongTon;
            batch.SubtractQuantity(take);
            result.Add(new AllocationLine(batch, take, before));
            need -= take;
        }
        return result;
    }

    /// <summary>
    /// Preview phân bổ FEFO — KHÔNG trừ kho, chỉ tính toán.
    /// </summary>
    /// <param name="fefoSortedBatches">Danh sách lô đã được sắp xếp tăng dần theo HanSuDung.</param>
    /// <param name="need">Tổng số lượng cần lấy.</param>
    /// <returns>Danh sách phân bổ dự kiến (SoLuongTon không thay đổi).</returns>
    public IReadOnlyList<AllocationLine> Preview(IEnumerable<TonKho> fefoSortedBatches, decimal need)
    {
        var result = new List<AllocationLine>();
        var remaining = need;
        foreach (var batch in fefoSortedBatches)
        {
            if (remaining <= 0) break;
            var take = Math.Min(remaining, batch.SoLuongTon);
            result.Add(new AllocationLine(batch, take, batch.SoLuongTon));
            remaining -= take;
        }
        return result;
    }

    /// <summary>Kiểm tra tổng tồn kho trong danh sách lô có đủ để đáp ứng số lượng cần không.</summary>
    public static bool HasSufficientStock(IEnumerable<TonKho> batches, decimal need)
        => batches.Sum(b => b.SoLuongTon) >= need;
}
