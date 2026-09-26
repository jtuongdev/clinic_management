using ClinicManagement.Application.DTOs.Payroll;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Payroll;
using ClinicManagement.Domain.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.Payroll;

public sealed record CapNhatDinhMucChucVuCommand(int Id, decimal ThuLaoMoiLuot) : IRequest<ChucVuRateDto>;

public sealed class CapNhatDinhMucChucVuHandler(IPayrollRepository repository)
    : IRequestHandler<CapNhatDinhMucChucVuCommand, ChucVuRateDto>
{
    public async Task<ChucVuRateDto> Handle(
        CapNhatDinhMucChucVuCommand command,
        CancellationToken cancellationToken)
    {
        if (command.ThuLaoMoiLuot < 0)
            throw new ArgumentOutOfRangeException(nameof(command.ThuLaoMoiLuot), "Thù lao mỗi lượt không được nhỏ hơn 0.");

        await repository.UpdateChucVuRateAsync(command.Id, command.ThuLaoMoiLuot, cancellationToken);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        var chucVu = await repository.GetChucVuByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Không tìm thấy chức vụ với Id = {command.Id}.");

        return new ChucVuRateDto
        {
            Id = chucVu.Id,
            TenChucVu = chucVu.TenChucVu,
            MoTa = chucVu.MoTa,
            ThuLaoMoiLuot = chucVu.ThuLaoMoiLuot
        };
    }
}

public sealed record CapNhatHoaHongLoaiDichVuCommand(List<UpdateHoaHongLoaiDichVuRequest> Items)
    : IRequest<IReadOnlyList<HoaHongLoaiDichVuDto>>;

public sealed class CapNhatHoaHongLoaiDichVuHandler(IPayrollRepository repository, IMediator mediator)
    : IRequestHandler<CapNhatHoaHongLoaiDichVuCommand, IReadOnlyList<HoaHongLoaiDichVuDto>>
{
    public async Task<IReadOnlyList<HoaHongLoaiDichVuDto>> Handle(
        CapNhatHoaHongLoaiDichVuCommand command,
        CancellationToken cancellationToken)
    {
        foreach (var item in command.Items)
        {
            if (item.TyLeHoaHong is < 0 or > 100)
                throw new ArgumentOutOfRangeException(nameof(item.TyLeHoaHong), $"Tỷ lệ hoa hồng cho {item.LoaiDichVu} phải từ 0 đến 100%.");
        }

        var entities = command.Items.Select(x => new CauHinhHoaHongLoaiDichVu(x.LoaiDichVu, x.TyLeHoaHong, x.GhiChu));
        await repository.SaveCauHinhHoaHongLoaiDichVusAsync(entities, cancellationToken);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

        return await mediator.Send(new LayDanhSachHoaHongLoaiDichVuQuery(), cancellationToken);
    }
}

public sealed record CapNhatDinhMucNhanVienCommand(int NhanVienId, decimal? ThuLaoMoiLuot) : IRequest<bool>;

public sealed class CapNhatDinhMucNhanVienHandler(IPayrollRepository repository)
    : IRequestHandler<CapNhatDinhMucNhanVienCommand, bool>
{
    public async Task<bool> Handle(
        CapNhatDinhMucNhanVienCommand command,
        CancellationToken cancellationToken)
    {
        if (command.ThuLaoMoiLuot.HasValue && command.ThuLaoMoiLuot.Value < 0)
            throw new ArgumentOutOfRangeException(nameof(command.ThuLaoMoiLuot), "Thù lao mỗi lượt không được nhỏ hơn 0.");

        await repository.UpdateEmployeeRateAsync(command.NhanVienId, command.ThuLaoMoiLuot, cancellationToken);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public sealed record CapNhatHoaHongDichVuCommand(int DichVuId, decimal? TyLeHoaHong) : IRequest<bool>;

public sealed class CapNhatHoaHongDichVuHandler(IPayrollRepository repository)
    : IRequestHandler<CapNhatHoaHongDichVuCommand, bool>
{
    public async Task<bool> Handle(
        CapNhatHoaHongDichVuCommand command,
        CancellationToken cancellationToken)
    {
        if (command.TyLeHoaHong.HasValue && (command.TyLeHoaHong.Value < 0 || command.TyLeHoaHong.Value > 100))
            throw new ArgumentOutOfRangeException(nameof(command.TyLeHoaHong), "Tỷ lệ hoa hồng phải từ 0 đến 100%.");

        await repository.UpdateServiceCommissionRateAsync(command.DichVuId, command.TyLeHoaHong, cancellationToken);
        await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
