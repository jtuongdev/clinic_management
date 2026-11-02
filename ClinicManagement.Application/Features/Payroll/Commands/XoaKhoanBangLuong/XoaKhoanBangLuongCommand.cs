using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record XoaKhoanBangLuongCommand(int BangLuongId, int ItemId) : IRequest<PayrollLineDto>;

public sealed class XoaKhoanBangLuongCommandHandler(IPayrollRepository repository)
    : IRequestHandler<XoaKhoanBangLuongCommand, PayrollLineDto>
{
    public async Task<PayrollLineDto> Handle(XoaKhoanBangLuongCommand command, CancellationToken cancellationToken)
    {
        var bangLuong = await repository.GetBangLuongAsync(command.BangLuongId, true, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy bảng lương với Id = {command.BangLuongId}.");

        if (bangLuong.KyLuong != null && bangLuong.KyLuong.TrangThai != "NHAP" && bangLuong.KyLuong.TrangThai != "DA_DUYET")
        {
            throw new InvalidOperationException("Chỉ có thể xóa khoản phụ cấp/khấu trừ khi kỳ lương ở trạng thái Nháp hoặc Đã duyệt.");
        }

        var removed = bangLuong.RemoveItem(command.ItemId)
            ?? throw new KeyNotFoundException($"Không tìm thấy khoản mục với Id = {command.ItemId}.");

        repository.RemoveBangLuongDetail(removed);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        return AnhXaBangLuong.MapLine(bangLuong);
    }
}
