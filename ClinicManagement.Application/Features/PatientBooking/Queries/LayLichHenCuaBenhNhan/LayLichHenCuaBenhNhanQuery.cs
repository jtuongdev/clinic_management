using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.Appointment;
using ClinicManagement.Application.DTOs.Common;
using ClinicManagement.Domain.Repositories;
using LichHenEntity = ClinicManagement.Domain.Appointment.LichHen;

namespace ClinicManagement.Application.Features.PatientBooking.Queries.LayLichHenCuaBenhNhan
{
    public class LayLichHenCuaBenhNhanQuery : IRequest<PagedResult<LichHenDto>>
    {
        public int PatientId { get; set; }
        public string? StatusGroup { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class LayLichHenCuaBenhNhanQueryHandler : IRequestHandler<LayLichHenCuaBenhNhanQuery, PagedResult<LichHenDto>>
    {
        private readonly ILichHenRepository _lichHenRepo;

        public LayLichHenCuaBenhNhanQueryHandler(ILichHenRepository lichHenRepo)
        {
            _lichHenRepo = lichHenRepo;
        }

        public async Task<PagedResult<LichHenDto>> Handle(LayLichHenCuaBenhNhanQuery request, CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _lichHenRepo.GetAppointmentsByPatientAsync(
                request.PatientId,
                request.StatusGroup,
                request.PageIndex,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(MapToDto).ToList();

            return new PagedResult<LichHenDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageIndex = request.PageIndex,
                PageSize = request.PageSize
            };
        }

        private static LichHenDto MapToDto(LichHenEntity entity)
        {
            return new LichHenDto
            {
                Id = entity.Id,
                MaBenhNhan = entity.MaBenhNhan,
                TenBenhNhan = entity.BenhNhan != null ? $"{entity.BenhNhan.Ho} {entity.BenhNhan.Ten}".Trim() : string.Empty,
                SoDienThoai = entity.BenhNhan?.DienThoai ?? string.Empty,
                SoCCCD = entity.BenhNhan?.SoCCCD ?? string.Empty,
                NgaySinh = entity.BenhNhan?.NgaySinh,
                GioiTinh = entity.BenhNhan?.GioiTinh.ToString() ?? string.Empty,
                DiaChi = entity.BenhNhan?.DiaChi ?? string.Empty,
                MaBacSi = entity.MaBacSi,
                TenBacSi = entity.BacSi?.HoTen ?? string.Empty,
                MaCoSo = entity.MaCoSo,
                TenCoSo = entity.CoSo?.Ten ?? string.Empty,
                MaKhoa = entity.MaKhoa,
                TenKhoa = entity.Khoa?.Ten ?? string.Empty,
                ThoiGianBatDau = entity.ThoiGianBatDau,
                ThoiGianKetThuc = entity.ThoiGianKetThuc,
                TrangThai = entity.TrangThai.ToString(),
                TrangThaiText = entity.TrangThai.ToString(),
                LyDo = entity.LyDo,
                NguonDat = entity.NguonDat,
                ChiPhiGiuCho = entity.ChiPhiGiuCho,
                DaThanhToanGiuCho = entity.DaThanhToanGiuCho,
                GhiChuHuy = entity.GhiChuHuy,
                CreatedAt = entity.CreatedAt
            };
        }
    }
}
