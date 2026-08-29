using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.LuotKham.Examination;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Repositories;
using MediatR;

namespace ClinicManagement.Application.Features.LuotKham.Commands
{
    public class SaveExaminationCommandHandler : IRequestHandler<SaveExaminationCommand, ExaminationResultDto>
    {
        private readonly ILuotKhamRepository _luotKhamRepo;

        public SaveExaminationCommandHandler(ILuotKhamRepository luotKhamRepo)
        {
            _luotKhamRepo = luotKhamRepo;
        }

        public async Task<ExaminationResultDto> Handle(SaveExaminationCommand request, CancellationToken cancellationToken)
        {
            if (request.LuotKhamId <= 0)
                throw new ArgumentException("Id lượt khám không hợp lệ.");

            if (request.ExaminationData == null)
                throw new ArgumentException("Dữ liệu khám bệnh không được cung cấp.");

            // Lấy LuotKham với đầy đủ include
            var luotKham = await _luotKhamRepo.GetDetailByIdAsync(request.LuotKhamId, cancellationToken);
            if (luotKham == null)
                throw new KeyNotFoundException($"Không tìm thấy lượt khám với Id = {request.LuotKhamId}");

            // ====================================
            // CẬP NHẬT LÝ DO KHÁM
            // ====================================
            if (!string.IsNullOrWhiteSpace(request.ExaminationData.LyDoKham))
            {
                luotKham.SetLyDoKham(request.ExaminationData.LyDoKham.Trim());
            }
            if (request.ExaminationData.SinhHieu != null)
            {
                var sh = request.ExaminationData.SinhHieu;
                if (sh.Id.HasValue)
                {
                    var sinhHieu = luotKham.SinhHieus?
                        .FirstOrDefault(x => x.Id == sh.Id.Value && !x.IsDeleted);
                    if (sinhHieu == null)
                        throw new KeyNotFoundException($"Không tìm thấy sinh hiệu với Id = {sh.Id.Value}");

                    sinhHieu.Update(
                        sh.HuyetApTamThu,
                        sh.HuyetApTamTruong,
                        sh.Mach,
                        sh.NhietDo,
                        sh.CanNang,
                        sh.ChieuCao,
                        sh.SpO2);
                }
                else
                {
                    luotKham.AddSinhHieu(
                        sh.HuyetApTamThu,
                        sh.HuyetApTamTruong,
                        sh.Mach,
                        sh.NhietDo,
                        sh.CanNang,
                        sh.ChieuCao,
                        sh.SpO2,
                        request.CreatedBy > 0 ? request.CreatedBy : 0
                    );
                }
            }

            // ====================================
            // CẬP NHẬT TIỀN SỬ BỆNH CHO BỆNH NHÂN
            // ====================================
            if (request.ExaminationData.TienSuBenhs != null && request.ExaminationData.TienSuBenhs.Any())
            {
                if (luotKham.BenhNhan == null)
                    throw new InvalidOperationException("Không thể lưu tiền sử bệnh vì không tìm thấy thông tin bệnh nhân của lượt khám.");

                foreach (var tienSu in request.ExaminationData.TienSuBenhs)
                {
                    if (string.IsNullOrWhiteSpace(tienSu.Ten) && string.IsNullOrWhiteSpace(tienSu.GhiChu))
                        continue;

                    var ten = tienSu.Ten?.Trim() ?? string.Empty;
                    var ghiChu = tienSu.GhiChu?.Trim() ?? string.Empty;

                    if (tienSu.Id.HasValue)
                    {
                        var tienSuBenh = luotKham.BenhNhan.TienSuBenhs?
                            .FirstOrDefault(x => x.Id == tienSu.Id.Value && !x.IsDeleted);
                        if (tienSuBenh == null)
                            throw new KeyNotFoundException($"Không tìm thấy tiền sử bệnh với Id = {tienSu.Id.Value}");

                        tienSuBenh.Update(tienSu.LoaiTienSu, ten, ghiChu);
                    }
                    else
                    {
                        luotKham.BenhNhan.AddTienSu(
                            tienSu.LoaiTienSu,
                            ten,
                            ghiChu,
                            request.CreatedBy > 0 ? request.CreatedBy : 0
                        );
                    }
                }
            }

            // ====================================
            // LƯU VÀO DATABASE
            // ====================================
            _luotKhamRepo.Update(luotKham);
            await _luotKhamRepo.UnitOfWork.SaveChangesAsync(cancellationToken);

            // ====================================
            // RETURN DTO
            // ====================================
            var sinhHieuMoiNhat = luotKham.SinhHieus?.OrderByDescending(s => s.ThoiDiemDo).FirstOrDefault();

            return new ExaminationResultDto
            {
                Id = luotKham.Id,
                MaBenhNhan = luotKham.MaBenhNhan,
                TenBenhNhan = $"{luotKham.BenhNhan?.Ho} {luotKham.BenhNhan?.Ten}".Trim(),
                MaBenhNhanNoiBo = luotKham.BenhNhan?.BenhNhanCoSo?.FirstOrDefault()?.MaBenhNhanNoiBo ?? string.Empty,
                MaBacSi = luotKham.MaBacSi,
                TenBacSi = luotKham.BacSi?.HoTen ?? string.Empty,
                Khoa = luotKham.Khoa?.Ten ?? string.Empty,
                Phong = luotKham.PhongKham?.Ten ?? string.Empty,
                TrangThai = luotKham.TrangThai.ToString(),
                NgayKham = luotKham.NgayKham,
                ThoiGianBatDauKham = luotKham.ThoiGianBatDauKham,
                LyDoKham = luotKham.LyDoKham,
                GhiChuTienSu = request.ExaminationData.GhiChuTienSu ?? string.Empty,
                SinhHieu = sinhHieuMoiNhat != null
                    ? new SinhHieuResultDto
                    {
                        Id = sinhHieuMoiNhat.Id,
                        NhietDo = sinhHieuMoiNhat.NhietDo,
                        Mach = sinhHieuMoiNhat.Mach,
                        HuyetApTamThu = sinhHieuMoiNhat.HuyetApTamThu,
                        HuyetApTamTruong = sinhHieuMoiNhat.HuyetApTamTruong,
                        SpO2 = sinhHieuMoiNhat.SpO2,
                        CanNang = sinhHieuMoiNhat.CanNang,
                        ChieuCao = sinhHieuMoiNhat.ChieuCao,
                        ThoiDiemDo = sinhHieuMoiNhat.ThoiDiemDo
                    }
                    : null,
                TienSuBenhs = luotKham.BenhNhan?.TienSuBenhs?
                    .Where(t => !t.IsDeleted)
                    .OrderByDescending(t => t.NgayGhiNhan)
                    .Select(t => new TienSuBenhResultDto
                    {
                        Id = t.Id,
                        LoaiTienSu = t.LoaiTienSu.ToString(),
                        Ten = t.Ten,
                        GhiChu = t.GhiChu
                    })
                    .ToList() ?? new List<TienSuBenhResultDto>(),
                ChanDoans = luotKham.ChanDoans?
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new ChanDoanResultDto
                    {
                        Id = c.Id,
                        MaICD = c.MaICD,
                        TenChanDoan = c.TenChanDoan,
                        LaChanDoanChinh = c.LaChanDoanChinh,
                        GhiChu = c.GhiChu,
                        CreatedAt = c.CreatedAt
                    })
                    .ToList() ?? new List<ChanDoanResultDto>()
            };
        }
    }
}
