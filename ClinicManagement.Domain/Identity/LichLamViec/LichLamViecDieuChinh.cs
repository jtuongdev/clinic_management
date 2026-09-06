using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Identity;

public class LichLamViecDieuChinh : BaseEntity
{
    public int MaLichLamViec { get; set; }
    public int? CaCu { get; set; }
    public int? CaMoi { get; set; }
    public int? PhongCu { get; set; }
    public int? PhongMoi { get; set; }
    public string TrangThaiCu { get; set; } = string.Empty;
    public string TrangThaiMoi { get; set; } = string.Empty;
    public string LyDo { get; set; } = string.Empty;
    public int NguoiThucHien { get; set; }
    public DateTime ThoiDiem { get; set; } = DateTime.UtcNow;

    public virtual LichLamViec LichLamViec { get; set; } = null!;
}
