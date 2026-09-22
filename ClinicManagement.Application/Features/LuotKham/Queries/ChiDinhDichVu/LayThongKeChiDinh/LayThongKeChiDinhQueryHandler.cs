using MediatR;
using Microsoft.EntityFrameworkCore;
using ClinicManagement.Application.DTOs.LuotKham;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class LayThongKeChiDinhQueryHandler
        : IRequestHandler<LayThongKeChiDinhQuery, ThongKeChiDinhDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepository;

        public LayThongKeChiDinhQueryHandler(ILuotKhamRepository luotKhamRepository)
        {
            _luotKhamRepository = luotKhamRepository;
        }

        public async Task<ThongKeChiDinhDto> Handle(LayThongKeChiDinhQuery request, CancellationToken cancellationToken)
        {
            var query = _luotKhamRepository.GetThongKeChiDinhDvLuotKham(request.MaCoSo, request.MaKhoa);

            var thongKeSoLuong = await query
                .SelectMany(lk => lk.ChiDinhDichVus.Where(cd => !cd.IsDeleted)) 
                .GroupBy(cd => 1)
                .Select(g => new
                {
                    TongChiDinh = g.Count(),
                    DangXuLy = g.Count(cd => cd.TrangThai == TrangThaiChiDinhDichVu.DaTiepNhan),
                    HoanThanh = g.Count(cd => cd.TrangThai == TrangThaiChiDinhDichVu.DaCoKetQua)
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (thongKeSoLuong == null)
            {
                return new ThongKeChiDinhDto
                {
                    TongChiDinh = 0,
                    DangXuLy = 0,
                    HoanThanh = 0,
                    TrungBinhTraKetQua = 0
                };
            }

            var hoanThanhItems = await query
                .SelectMany(lk => lk.ChiDinhDichVus.Where(cd => !cd.IsDeleted && cd.TrangThai == TrangThaiChiDinhDichVu.DaCoKetQua))
                .Select(cd => new
                {
                    ThoiGianXuLy = cd.NgayCoKetQua.HasValue && cd.NgayTiepNhan.HasValue
                        ? (cd.NgayCoKetQua.Value - cd.NgayTiepNhan.Value).TotalHours
                        : (double?)null
                })
                .ToListAsync(cancellationToken);

            double avgHours = 0;
            var validItems = hoanThanhItems.Where(x => x.ThoiGianXuLy.HasValue).ToList();
            if (validItems.Any())
            {
                avgHours = validItems.Average(x => x.ThoiGianXuLy.Value);
            }

            return new ThongKeChiDinhDto
            {
                TongChiDinh = thongKeSoLuong.TongChiDinh,
                DangXuLy = thongKeSoLuong.DangXuLy,
                HoanThanh = thongKeSoLuong.HoanThanh,
                TrungBinhTraKetQua = Math.Round(avgHours, 1)
            };
        }
    }
}
