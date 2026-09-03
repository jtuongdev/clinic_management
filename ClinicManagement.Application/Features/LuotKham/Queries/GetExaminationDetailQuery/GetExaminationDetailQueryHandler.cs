using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham.Examination;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetExaminationDetailQueryHandler : IRequestHandler<GetExaminationDetailQuery, ExaminationDetailResponseDto>
    {
        private readonly ILuotKhamRepository _repository;

        public GetExaminationDetailQueryHandler(ILuotKhamRepository repository)
        {
            _repository = repository;
        }

        public async Task<ExaminationDetailResponseDto> Handle(GetExaminationDetailQuery request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Id lượt khám không hợp lệ.");

            // Sử dụng repository mới (trả về LuotKham?)
            var luotKham = await _repository.GetTienSinhHieuLuotKhamByIdAsync(request.LuotKhamId, cancellationToken);

            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám với Id = {request.LuotKhamId}");

            // 1. Lấy sinh hiệu mới nhất
            var latestSinhHieu = luotKham.SinhHieus?
                .OrderByDescending(sh => sh.ThoiDiemDo)
                .FirstOrDefault();

            // 2. Lấy danh sách tiền sử bệnh từ BenhNhan (nếu có)
            var tienSuBenhs = luotKham.BenhNhan?.TienSuBenhs?
                .Where(ts => !ts.IsDeleted)
                .Select(ts => new TienSuBenhDto
                {
                    Id = ts.Id,
                    LoaiTienSu = (int)ts.LoaiTienSu, // Giả sử LoaiTienSu là enum hoặc int
                    Ten = ts.Ten ?? string.Empty,
                    GhiChu = ts.GhiChu
                })
                .ToList();

            // 3. Xây dựng DTO response
            var dto = new ExaminationDetailResponseDto
            {
                LyDoKham = luotKham.LyDoKham ?? string.Empty,
                GhiChuTienSu = null, // Có thể lấy từ tiền sử đầu tiên nếu cần
                TienSuBenhs = tienSuBenhs,
                SinhHieu = latestSinhHieu == null ? null : new SinhHieuDto
                {
                    Id = latestSinhHieu.Id,
                    ThoiDiemDo = latestSinhHieu.ThoiDiemDo,
                    HuyetApTamThu = latestSinhHieu.HuyetApTamThu,
                    HuyetApTamTruong = latestSinhHieu.HuyetApTamTruong,
                    Mach = latestSinhHieu.Mach,
                    NhietDo = latestSinhHieu.NhietDo,
                    CanNang = latestSinhHieu.CanNang,
                    ChieuCao = latestSinhHieu.ChieuCao,
                    SpO2 = latestSinhHieu.SpO2
                }
            };

            return dto;
        }
    }
}