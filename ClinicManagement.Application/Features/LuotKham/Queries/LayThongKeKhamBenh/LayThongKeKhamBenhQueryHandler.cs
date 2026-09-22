using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayThongKeKhamBenhQueryHandler
        : IRequestHandler<LayThongKeKhamBenhQuery, ThongKeKhamBenhDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayThongKeKhamBenhQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<ThongKeKhamBenhDto> Handle(LayThongKeKhamBenhQuery request, CancellationToken cancellationToken)
        {
            var query = _luotKhamRepo.GetThongTrangThaiLuotKham(request.MaCoSo, request.MaKhoa);
            var thongKe = await query
                .Select(l => new
                {
                    IsCho = l.TrangThai == TrangThaiLuotKham.CHO_KHAM ? 1 : 0,
                    IsDangKham = l.TrangThai == TrangThaiLuotKham.DANG_KHAM ? 1 : 0,
                    IsChoCLS = l.TrangThai == TrangThaiLuotKham.CHO_CLS ? 1 : 0,
                    IsHoanThanh = l.TrangThai == TrangThaiLuotKham.HOAN_THANH ? 1 : 0
                })
                .GroupBy(x => 1) // Nhóm tạm thời để dùng hàm Sum
                .Select(g => new ThongKeKhamBenhDto
                {
                    Cho = g.Sum(x => x.IsCho),
                    DangKham = g.Sum(x => x.IsDangKham),
                    ChoCLS = g.Sum(x => x.IsChoCLS),
                    HoanThanh = g.Sum(x => x.IsHoanThanh),
                    
                })
                .FirstOrDefaultAsync(cancellationToken) ?? new ThongKeKhamBenhDto();

            return thongKe;
        }
    }
}
