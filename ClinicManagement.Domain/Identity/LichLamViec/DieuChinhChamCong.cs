using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.Identity;

public class DieuChinhChamCong : BaseEntity
{
    public int MaChamCong { get; set; }
    public int MaNhanVien { get; set; }
    public DateTime? CheckInCu { get; set; }
    public DateTime? CheckOutCu { get; set; }
    public DateTime? CheckInMoi { get; set; }
    public DateTime? CheckOutMoi { get; set; }
    public string LyDo { get; set; } = string.Empty;
    public TrangThaiDieuChinhChamCong TrangThai { get; private set; } = TrangThaiDieuChinhChamCong.CHO_DUYET;
    public int? NguoiDuyet { get; private set; }
    public DateTime? ThoiGianDuyet { get; private set; }
    public string GhiChuDuyet { get; private set; } = string.Empty;
    public virtual ChamCong ChamCong { get; set; } = null!;
    public virtual NhanVien NhanVien { get; set; } = null!;

    public void Approve(int reviewerId, string? note = null)
    {
        if (TrangThai != TrangThaiDieuChinhChamCong.CHO_DUYET) throw new InvalidOperationException("Yêu cầu đã được xử lý.");
        TrangThai = TrangThaiDieuChinhChamCong.DA_DUYET; NguoiDuyet = reviewerId; ThoiGianDuyet = DateTime.UtcNow; GhiChuDuyet = note?.Trim() ?? string.Empty;
    }
    public void Reject(int reviewerId, string? note = null)
    {
        if (TrangThai != TrangThaiDieuChinhChamCong.CHO_DUYET) throw new InvalidOperationException("Yêu cầu đã được xử lý.");
        TrangThai = TrangThaiDieuChinhChamCong.TU_CHOI; NguoiDuyet = reviewerId; ThoiGianDuyet = DateTime.UtcNow; GhiChuDuyet = note?.Trim() ?? string.Empty;
    }
}
