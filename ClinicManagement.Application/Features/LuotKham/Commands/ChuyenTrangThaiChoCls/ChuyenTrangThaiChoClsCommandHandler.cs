using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands.ChuyenTrangThaiChoCls;

public class ChuyenTrangThaiChoClsCommandHandler(ILuotKhamRepository luotKhamRepository)
    : IRequestHandler<ChuyenTrangThaiChoClsCommand, ChuyenTrangThaiChoClsResultDto>
{
    public async Task<ChuyenTrangThaiChoClsResultDto> Handle(
        ChuyenTrangThaiChoClsCommand request,
        CancellationToken cancellationToken)
    {
        var visit = await luotKhamRepository.GetByIdAsync(request.LuotKhamId)
            ?? throw new KeyNotFoundException($"Không tìm thấy lượt khám {request.LuotKhamId}.");

        if (request.HanhDong == HanhDongChuyenTrangThaiCls.ChuyenChoCls)
        {
            visit.SendToParaclinical();
        }
        else if (request.HanhDong == HanhDongChuyenTrangThaiCls.TiepTucKham)
        {
            visit.ResumeExam();
        }
        else
        {
            throw new ArgumentOutOfRangeException(nameof(request.HanhDong), "Hành động chuyển trạng thái không hợp lệ.");
        }

        luotKhamRepository.Update(visit);
        await luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);

        return new ChuyenTrangThaiChoClsResultDto
        {
            LuotKhamId = visit.Id,
            TrangThai = visit.TrangThai.ToString(),
            Message = request.HanhDong == HanhDongChuyenTrangThaiCls.ChuyenChoCls
                ? "Đã chuyển lượt khám sang trạng thái chờ kết quả cận lâm sàng."
                : "Đã tiếp tục tiến trình khám cho bệnh nhân."
        };
    }
}
