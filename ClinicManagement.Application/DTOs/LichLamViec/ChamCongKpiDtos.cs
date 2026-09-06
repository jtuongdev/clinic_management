namespace ClinicManagement.Application.DTOs.LichLamViec;

public sealed class ChamCongKpiSummaryDto
{
    public DateTime FromDate { get; init; }
    public DateTime ToDate { get; init; }
    public int? MaKhoa { get; init; }
    public int? MaNhanVien { get; init; }
    public int TongLich { get; init; }
    public int LichLamViec { get; init; }
    public int LichNghi { get; init; }
    public int LichHuy { get; init; }
    public int TongChamCong { get; init; }
    public int DaCheckIn { get; init; }
    public int DaCheckOut { get; init; }
    public int ThieuCheckOut { get; init; }
    public int ChoXacNhan { get; init; }
    public int VangMat { get; init; }
    public int NghiPhep { get; init; }
    public int DiDungGio { get; init; }
    public int DiMuon { get; init; }
    public double TongGioLam { get; init; }
}
