using MediatR;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayThongKeBenhNhanQueryHandler
        : IRequestHandler<LayThongKeBenhNhanQuery, ThongKeBenhNhanDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public LayThongKeBenhNhanQueryHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<ThongKeBenhNhanDto> Handle(
            LayThongKeBenhNhanQuery request,
            CancellationToken cancellationToken)
        {
            var query = _luotKhamRepo.GetQueryable()
                .Where(l => !l.IsDeleted);

            if (request.MaCoSo.HasValue)
                query = query.Where(l => l.MaCoSo == request.MaCoSo.Value);

            if (request.MaKhoa.HasValue)
                query = query.Where(l => l.MaKhoa == request.MaKhoa.Value);

            var today = DateTime.Today;

            var homNay = await query
                .Where(l => l.NgayKham.Date == today)
                .CountAsync(cancellationToken);

            var cho = await query
                .Where(l => l.TrangThai == TrangThaiLuotKham.CHO_KHAM)
                .CountAsync(cancellationToken);

            var dangKham = await query
                .Where(l => l.TrangThai == TrangThaiLuotKham.DANG_KHAM)
                .CountAsync(cancellationToken);

            var hoanThanh = await query
                .Where(l => l.TrangThai == TrangThaiLuotKham.HOAN_THANH)
                .CountAsync(cancellationToken);

            return new ThongKeBenhNhanDto
            {
                HomNay = homNay,
                Cho = cho,
                DangKham = dangKham,
                HoanThanh = hoanThanh
            };
        }
    }
}