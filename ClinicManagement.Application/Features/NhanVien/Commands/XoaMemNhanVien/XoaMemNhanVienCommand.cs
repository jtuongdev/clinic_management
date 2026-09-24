using MediatR;

namespace ClinicManagement.Application.Features.NhanVien.Commands;

public sealed record XoaMemNhanVienCommand(
    int Id,
    DateTime NgayNghiViec,
    string LyDo,
    int DeletedBy) : IRequest<XoaMemNhanVienResult>;

public sealed record XoaMemNhanVienResult(
    int Id,
    int SoMauLichDaVoHieu,
    int SoLichTuongLaiDaHuy,
    int SoQuyenDaThuHoi);
