using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec;

public record GetChamCongKpiSummaryQuery(
    DateTime FromDate,
    DateTime ToDate,
    int? MaKhoa = null,
    int? MaNhanVien = null) : IRequest<ChamCongKpiSummaryDto>;

public sealed class GetChamCongKpiSummaryHandler
    : IRequestHandler<GetChamCongKpiSummaryQuery, ChamCongKpiSummaryDto>
{
    private readonly ILichLamViecRepository scheduleRepository;
    private readonly IChamCongRepository attendanceRepository;

    public GetChamCongKpiSummaryHandler(
        ILichLamViecRepository scheduleRepository,
        IChamCongRepository attendanceRepository)
    {
        this.scheduleRepository = scheduleRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public async Task<ChamCongKpiSummaryDto> Handle(
        GetChamCongKpiSummaryQuery request,
        CancellationToken cancellationToken)
    {
        if (request.ToDate.Date < request.FromDate.Date)
            throw new ArgumentException("Khoảng ngày không hợp lệ.");

        var schedules = await scheduleRepository.GetByDateRangeAsync(
            request.FromDate, request.ToDate, request.MaNhanVien, request.MaKhoa, cancellationToken);
        var attendances = await attendanceRepository.GetByDateRangeAsync(
            request.FromDate, request.ToDate, request.MaNhanVien, cancellationToken);
        if (request.MaKhoa.HasValue)
        {
            var scheduleIds = schedules.Select(x => x.Id).ToHashSet();
            attendances = attendances
                .Where(x => x.MaLichLamViec.HasValue && scheduleIds.Contains(x.MaLichLamViec.Value))
                .ToList();
        }

        return new ChamCongKpiSummaryDto
        {
            FromDate = request.FromDate.Date,
            ToDate = request.ToDate.Date,
            MaKhoa = request.MaKhoa,
            MaNhanVien = request.MaNhanVien,
            TongLich = schedules.Count,
            LichLamViec = schedules.Count(x => x.TrangThai == TrangThaiLichLamViec.LAM_VIEC),
            LichNghi = schedules.Count(x => x.TrangThai == TrangThaiLichLamViec.NGHI),
            LichHuy = schedules.Count(x => x.TrangThai == TrangThaiLichLamViec.HUY),
            TongChamCong = attendances.Count,
            DaCheckIn = attendances.Count(x => x.CheckIn.HasValue),
            DaCheckOut = attendances.Count(x => x.CheckOut.HasValue),
            ThieuCheckOut = attendances.Count(x => x.TrangThai == TrangThaiChamCong.THIEU_CHECK_OUT),
            ChoXacNhan = attendances.Count(x => x.TrangThai == TrangThaiChamCong.CHO_XAC_NHAN),
            VangMat = attendances.Count(x => x.TrangThai == TrangThaiChamCong.VANG_MAT),
            NghiPhep = attendances.Count(x => x.TrangThai == TrangThaiChamCong.NGHI_PHEP),
            DiDungGio = attendances.Count(x => x.TrangThai == TrangThaiChamCong.DI_DUNG_GIO),
            DiMuon = attendances.Count(x => x.TrangThai is TrangThaiChamCong.DI_MUON or TrangThaiChamCong.DI_MUON_VE_SOM),
            TongGioLam = Math.Round(attendances.Sum(x => x.GioLamThucTe), 2)
        };
    }
}
