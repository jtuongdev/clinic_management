using MediatR;
using ClinicManagement.Application.DTOs.Khoa;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.Khoa.Queries
{
    public class LayTongQuanKhoaQueryHandler
        : IRequestHandler<LayTongQuanKhoaQuery, List<KhoaOverviewDto>>
    {
        private readonly IKhoaRepository _khoaRepo;

        public LayTongQuanKhoaQueryHandler(IKhoaRepository khoaRepo)
        {
            _khoaRepo = khoaRepo;
        }

        public async Task<List<KhoaOverviewDto>> Handle(
            LayTongQuanKhoaQuery request,
            CancellationToken cancellationToken)
        {
            // 1. Lấy dữ liệu từ Repository
            var khoas = await _khoaRepo.GetKhoasWithDetailsAsync(
                request.MaCoSo,
                cancellationToken);

            var today = DateTime.Today;

            var result = new List<KhoaOverviewDto>();

            foreach (var khoa in khoas)
            {
                // 2. Tính toán các chỉ số
                var tongLuot = khoa.LuotKhams.Count(l => !l.IsDeleted);

                var soLuotCho = khoa.LuotKhams.Count(l =>
                    l.TrangThai == TrangThaiLuotKham.CHO_KHAM && !l.IsDeleted);

                var soBacSi = khoa.NhanVienKhoa.Count(nk =>
                    nk.NhanVien != null &&
                    nk.NhanVien.MaChucVu == 4 &&
                    nk.NhanVien.IsActive &&
                    !nk.NhanVien.IsDeleted &&
                    (nk.DenNgay == null || nk.DenNgay >= today));

                // 3. Xác định trạng thái
                string trangThai;
                if (soLuotCho >= 10)
                    trangThai = "QuaTai";
                else if (soLuotCho >= 5)
                    trangThai = "HoatDong";
                else
                    trangThai = "BinhThuong";

                result.Add(new KhoaOverviewDto
                {
                    MaKhoa = khoa.Id,
                    TenKhoa = khoa.Ten,
                    TongLuotKham = tongLuot,
                    SoLuotCho = soLuotCho,
                    SoBacSi = soBacSi,
                    TrangThai = trangThai
                });
            }

            // 4. Sắp xếp theo số lượt khám giảm dần
            return result.OrderByDescending(k => k.TongLuotKham).ToList();
        }
    }
}