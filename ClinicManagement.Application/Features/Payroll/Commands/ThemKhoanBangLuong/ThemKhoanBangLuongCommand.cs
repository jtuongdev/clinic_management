using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record ThemKhoanBangLuongCommand(int BangLuongId, AddItemRequest Request) : IRequest<PayrollLineDto>;

public sealed class ThemKhoanBangLuongCommandHandler(IPayrollRepository repository)
    : IRequestHandler<ThemKhoanBangLuongCommand, PayrollLineDto>
{
    public async Task<PayrollLineDto> Handle(ThemKhoanBangLuongCommand command, CancellationToken cancellationToken)
    {
        var bangLuong = await repository.GetBangLuongAsync(command.BangLuongId, true, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy bảng lương với Id = {command.BangLuongId}.");

        if (bangLuong.KyLuong != null && bangLuong.KyLuong.TrangThai != "NHAP" && bangLuong.KyLuong.TrangThai != "DA_DUYET")
        {
            throw new InvalidOperationException("Chỉ có thể thêm khoản phụ cấp/khấu trừ khi kỳ lương ở trạng thái Nháp hoặc Đã duyệt.");
        }

        bangLuong.AddItem(command.Request.LoaiKhoan, command.Request.TenKhoan, command.Request.SoTien, command.Request.GhiChu ?? "");
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        return AnhXaBangLuong.MapLine(bangLuong);
    }
}
