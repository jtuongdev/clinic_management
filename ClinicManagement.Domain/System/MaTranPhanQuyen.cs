using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;

namespace ClinicManagement.Domain.System;

public sealed class MaTranPhanQuyen : BaseEntity
{
    public int MaVaiTro { get; set; }
    public string PhanHe { get; set; } = string.Empty;
    public HanhDongQuyen HanhDong { get; set; }
    public PhamViDuLieu PhamViDuLieu { get; set; }
    public bool DuocPhep { get; set; }
}
