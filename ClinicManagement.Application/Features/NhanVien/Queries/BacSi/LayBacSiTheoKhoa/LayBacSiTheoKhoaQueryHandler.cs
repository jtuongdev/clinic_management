using MediatR;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Application.DTOs.PhongKham;
using ClinicManagement.Domain.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class LayBacSiTheoKhoaQueryHandler
        : IRequestHandler<LayBacSiTheoKhoaQuery, List<BacSiDto>>
    {
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly IPhongKhamRepository _phongKhamRepo; 

        public LayBacSiTheoKhoaQueryHandler(
            INhanVienRepository nhanVienRepo,
            IPhongKhamRepository phongKhamRepo) 
        {
            _nhanVienRepo = nhanVienRepo;
            _phongKhamRepo = phongKhamRepo;
        }

        public async Task<List<BacSiDto>> Handle(
            LayBacSiTheoKhoaQuery request,
            CancellationToken cancellationToken)
        {
            var bacSiKhoas = await _nhanVienRepo.GetBacSiByKhoaAsync(
                request.MaKhoa,
                request.MaCoSo,
                cancellationToken);

            var phongKhams = await _phongKhamRepo.GetByKhoaAsync(request.MaKhoa);
            var phongKhamDtos = phongKhams.Select(p => new PhongKhamDto
            {
                Id = p.Id,
                Ma = p.Ma,
                Ten = p.Ten,
                MaKhoa = p.MaKhoa,
                TrangThai = p.TrangThai
            }).ToList();

            return bacSiKhoas.Select(item =>
            {
                var nv = item.NhanVien;
                var maPhongKham = item.MaPhongKhamMacDinh;
                var tenPhongKham = item.TenPhongKhamMacDinh;

                // Nếu chưa gán phòng khám trong lịch trực, fallback lấy phòng khám đầu tiên của khoa nếu có
                if (!maPhongKham.HasValue && phongKhamDtos.Count > 0)
                {
                    maPhongKham = phongKhamDtos[0].Id;
                    tenPhongKham = phongKhamDtos[0].Ten;
                }

                return new BacSiDto
                {
                    Id = nv.Id,
                    MaNhanVien = !string.IsNullOrEmpty(nv.Username) ? nv.Username : $"NV{nv.Id:D4}",
                    HoTen = nv.HoTen,
                    ChuyenKhoa = nv.ChuyenKhoa,
                    SoHanhNghe = nv.SoHanhNghe,
                    Email = nv.Email,
                    DienThoai = nv.DienThoai,
                    DangTruc = item.DangTruc,
                    MaPhongKhamMacDinh = maPhongKham,
                    TenPhongKhamMacDinh = tenPhongKham,
                    DanhSachPhongKham = phongKhamDtos
                };
            })
            .OrderByDescending(b => b.DangTruc)
            .ThenBy(b => b.HoTen)
            .ToList();
        }
    }
}