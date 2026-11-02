using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Identity;

public class KyChamCong : BaseEntity
{
    public DateTime TuNgay { get; set; }
    public DateTime DenNgay { get; set; }
    public bool DaKhoa { get; private set; }
    public int? NguoiKhoa { get; private set; }
    public DateTime? ThoiGianKhoa { get; private set; }
    public string GhiChu { get; set; } = string.Empty;

    public void Lock(int userId)
    {
        if (TuNgay.Date > DenNgay.Date) throw new InvalidOperationException("Khoảng kỳ chấm công không hợp lệ.");
        DaKhoa = true; NguoiKhoa = userId; ThoiGianKhoa = DateTime.UtcNow;
    }
    public void Unlock()
    {
        DaKhoa = false; NguoiKhoa = null; ThoiGianKhoa = null;
    }
}
