using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Inventory;

public class Stocktake : BaseEntity, IAggregateRoot
{
    public string ReferenceCode { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public TrangThaiKiemKe Status { get; set; } = TrangThaiKiemKe.MOI_TAO;
    public int? CreatedByUserId { get; set; }
    public int? SubmittedByUserId { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public ICollection<StocktakeCount> Counts { get; set; } = new List<StocktakeCount>();

    public void Submit(int userId = 0)
    {
        if (Status != TrangThaiKiemKe.MOI_TAO) throw new InvalidOperationException("Đợt kiểm kê không ở trạng thái mở.");
        Status = TrangThaiKiemKe.DA_NOP;
        SubmittedAt = DateTime.UtcNow;
        if (userId > 0) SubmittedByUserId = userId;
    }

    public void Approve(int userId)
    {
        if (Status != TrangThaiKiemKe.DA_NOP) throw new InvalidOperationException("Đợt kiểm kê chưa được nộp.");
        Status = TrangThaiKiemKe.DA_DUYET;
        ApprovedAt = DateTime.UtcNow;
        ApprovedByUserId = userId;
    }
}

