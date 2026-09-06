using MediatR;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Application.DTOs.PhongKham;
using ClinicManagement.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ClinicManagement.Application.Features.NhanVien.Queries
{
    public class GetBacSiByKhoaQueryHandler
        : IRequestHandler<GetBacSiByKhoaQuery, List<BacSiDto>>
    {
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly IPhongKhamRepository _phongKhamRepo; 

        public GetBacSiByKhoaQueryHandler(
            INhanVienRepository nhanVienRepo,
            IPhongKhamRepository phongKhamRepo) 
        {
            _nhanVienRepo = nhanVienRepo;
            _phongKhamRepo = phongKhamRepo;
        }

        public async Task<List<BacSiDto>> Handle(
            GetBacSiByKhoaQuery request,
            CancellationToken cancellationToken)
        {
            var bacSis = await _nhanVienRepo.GetBacSiByKhoaAsync(
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

            return bacSis.Select(nv => new BacSiDto
            {
                Id = nv.Id,
                HoTen = nv.HoTen,
                ChuyenKhoa = nv.ChuyenKhoa,
                SoHanhNghe = nv.SoHanhNghe,
                Email = nv.Email,
                DienThoai = nv.DienThoai,
                PhongKhams = phongKhamDtos 
            }).ToList();
        }
    
    
    
    
    }
}