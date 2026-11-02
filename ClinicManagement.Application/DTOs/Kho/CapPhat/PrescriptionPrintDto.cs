namespace ClinicManagement.Application.DTOs.Kho.CapPhat;

public sealed record PrescriptionPrintDto(
    PrescriptionPrintHeaderDto Header,
    PrescriptionPrintPatientDto BenhNhan,
    PrescriptionPrintDiagnosisDto ChanDoan,
    IReadOnlyList<PrescriptionPrintItemDto> DanhSachThuoc,
    IReadOnlyList<string> LoiDan,
    PrescriptionPrintConfirmationDto XacNhan,
    IReadOnlyList<string> GhiChuChanTrang);

public sealed record PrescriptionPrintHeaderDto(
    string SoYTe,
    PrescriptionPrintFacilityDto CoSo,
    string MaDonThuoc,
    string MaLuotKham,
    string MaBenhNhan,
    string TieuDe,
    string PhuDe);

public sealed record PrescriptionPrintFacilityDto(
    string Ten,
    string DiaChi,
    string Hotline);

public sealed record PrescriptionPrintPatientDto(
    string HoTen,
    int Tuoi,
    string GioiTinh,
    string SoCccdBhyt,
    string DienThoai,
    string DiaChi);

public sealed record PrescriptionPrintDiagnosisDto(
    string MaICD,
    string TenChanDoan);

public sealed record PrescriptionPrintItemDto(
    int Stt,
    string MaThuoc,
    string TenThuoc,
    string DangBaoChe,
    decimal SoLuong,
    string SoLuongChu,
    string DonViTinh,
    IReadOnlyList<PrescriptionPrintBatchDto> LoHang,
    string CachDung);

public sealed record PrescriptionPrintBatchDto(
    string SoLo,
    DateTime? HanSuDung,
    decimal SoLuong);

public sealed record PrescriptionPrintConfirmationDto(
    DateTime NgayKe,
    PrescriptionPrintDoctorDto BacSiKeDon,
    PrescriptionPrintDispenserDto DuocSiPhatThuoc);

public sealed record PrescriptionPrintDoctorDto(
    string HoTen,
    string MaCCHN);

public sealed record PrescriptionPrintDispenserDto(
    string HoTen,
    string TrangThaiCapPhat);
