using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Examination; 
using ClinicManagement.Domain.Common.Enums;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetThongKeDonThuocQueryHandler
        : IRequestHandler<GetThongKeDonThuocQuery, ThongKeDonThuocDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public GetThongKeDonThuocQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<ThongKeDonThuocDto> Handle(GetThongKeDonThuocQuery request, CancellationToken cancellationToken)
        {
            var query = _luotKhamRepo.GetThongKeDonThuocLuotKham(request.MaCoSo, request.MaKhoa);

            var thongKeRaw = await query
                .SelectMany(l => l.DonThuocs) // Đi sâu vào danh sách đơn thuốc của các lượt khám
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TongSoDon = g.Count(),
                    // Lúc này biến 'dt' đại diện cho DonThuoc nên so sánh với TrangThaiDonThuoc là HOÀN TOÀN HỢP LỆ
                    SoDonTam = g.Count(dt => dt.TrangThai == TrangThaiDonThuoc.TAM),
                    SoDonDaDuyet = g.Count(dt => dt.TrangThai == TrangThaiDonThuoc.DA_DUYET),
                    SoDonDaXuatHet = g.Count(dt => dt.TrangThai == TrangThaiDonThuoc.DA_XUAT_HET),
                    SoDonHuy = g.Count(dt => dt.TrangThai == TrangThaiDonThuoc.HUY)
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (thongKeRaw == null)
            {
                return new ThongKeDonThuocDto();
            }

            return new ThongKeDonThuocDto
            {
                TongDonThuoc = thongKeRaw.TongSoDon,
                Tam = thongKeRaw.SoDonTam,
                DaDuyet = thongKeRaw.SoDonDaDuyet,
                DaXuatHet = thongKeRaw.SoDonDaXuatHet,
                DaHuy = thongKeRaw.SoDonHuy
            };
        }

    
    }
}
