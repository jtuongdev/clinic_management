using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LichHen.Queries.LayThongKeLichHen
{
    public class LayThongKeLichHenQuery : IRequest<ThongKeLichHenDto>
    {
        public int? MaCoSo { get; set; }
        public DateTime? Ngay { get; set; }
    }

    public class LayThongKeLichHenQueryHandler : IRequestHandler<LayThongKeLichHenQuery, ThongKeLichHenDto>
    {
        private readonly ILichHenRepository _lichHenRepo;

        public LayThongKeLichHenQueryHandler(ILichHenRepository lichHenRepo)
        {
            _lichHenRepo = lichHenRepo;
        }

        public async Task<ThongKeLichHenDto> Handle(LayThongKeLichHenQuery request, CancellationToken cancellationToken)
        {
            var query = _lichHenRepo.GetQueryable().AsNoTracking().Where(lh => !lh.IsDeleted);

            if (request.MaCoSo.HasValue && request.MaCoSo.Value > 0)
            {
                query = query.Where(lh => lh.MaCoSo == request.MaCoSo.Value);
            }

            if (request.Ngay.HasValue)
            {
                var start = request.Ngay.Value.Date;
                var end = start.AddDays(1).AddTicks(-1);
                query = query.Where(lh => lh.ThoiGianBatDau >= start && lh.ThoiGianBatDau <= end);
            }

            var list = await query
                .Select(lh => new { lh.TrangThai, lh.DaThanhToanGiuCho, lh.ChiPhiGiuCho })
                .ToListAsync(cancellationToken);

            var choThuTien = list.Count(x => x.TrangThai == TrangThaiLichHen.CHO_XAC_NHAN);
            var daXacNhan = list.Count(x => x.TrangThai == TrangThaiLichHen.DA_XAC_NHAN);
            var daDen = list.Count(x => x.TrangThai == TrangThaiLichHen.DA_DEN || x.TrangThai == TrangThaiLichHen.HOAN_THANH);
            var daHuy = list.Count(x => x.TrangThai == TrangThaiLichHen.DA_HUY);

            // Doanh thu từ tiền cọc đã thu (kể cả đã đến hoặc hủy no-show thì phòng khám vẫn giữ khoản 100k)
            var tongTien = list.Where(x => x.DaThanhToanGiuCho).Sum(x => x.ChiPhiGiuCho);

            return new ThongKeLichHenDto
            {
                TongLichHen = list.Count,
                ChoThuTien = choThuTien,
                DaXacNhan = daXacNhan,
                DaTiepNhan = daDen,
                DaHuy = daHuy,
                TongTienDaThu = tongTien
            };
        }
    }
}
