using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClinicManagement.Application.DTOs.NhanVien;
using ClinicManagement.Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Application.Features.NhanVien.Queries.LayDanhSachNhanVienLookup;

public class LayDanhSachNhanVienLookupQueryHandler : IRequestHandler<LayDanhSachNhanVienLookupQuery, IReadOnlyList<NhanVienLookupDto>>
{
    private readonly INhanVienRepository _nhanVienRepo;

    public LayDanhSachNhanVienLookupQueryHandler(INhanVienRepository nhanVienRepo)
    {
        _nhanVienRepo = nhanVienRepo;
    }

    public async Task<IReadOnlyList<NhanVienLookupDto>> Handle(LayDanhSachNhanVienLookupQuery request, CancellationToken cancellationToken)
    {
        // 1. Khởi tạo truy vấn AsNoTracking tối ưu bộ nhớ
        var query = _nhanVienRepo.GetQueryable()
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        // 2. Lọc trạng thái hoạt động (nếu có)
        if (request.IsActive.HasValue)
        {
            query = query.Where(x => x.IsActive == request.IsActive.Value);
        }

        // 3. Lọc theo Cơ sở (nếu có)
        if (request.MaCoSo.HasValue && request.MaCoSo.Value > 0)
        {
            query = query.Where(x => x.NhanVienKhoa.Any(k => k.Khoa.MaCoSo == request.MaCoSo.Value)
                                  || x.PhanQuyenCoSo.Any(p => p.MaCoSo == request.MaCoSo.Value));
        }

        // 4. Lọc theo Khoa phòng (nếu có)
        if (request.MaKhoa.HasValue && request.MaKhoa.Value > 0)
        {
            query = query.Where(x => x.NhanVienKhoa.Any(k => k.MaKhoa == request.MaKhoa.Value));
        }

        // 5. Lọc theo Mã chức vụ (nếu có)
        if (request.MaChucVu.HasValue && request.MaChucVu.Value > 0)
        {
            query = query.Where(x => x.MaChucVu == request.MaChucVu.Value);
        }

        // 6. Lọc theo Tên chức vụ hoặc chuyên khoa
        if (!string.IsNullOrWhiteSpace(request.ChucVu))
        {
            var cv = request.ChucVu.Trim().ToLower();
            query = query.Where(x => (x.ChucVu != null && x.ChucVu.TenChucVu.ToLower().Contains(cv))
                                  || x.ChuyenKhoa.ToLower().Contains(cv));
        }

        // 7. Tìm kiếm nhanh theo keyword (Họ tên, Username, Số điện thoại)
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var kw = request.Keyword.Trim().ToLower();
            query = query.Where(x => x.HoTen.ToLower().Contains(kw)
                                  || x.Username.ToLower().Contains(kw)
                                  || x.DienThoai.Contains(kw));
        }

        // 8. Projection trực tiếp sang DTO (Chỉ select đúng các cột cần thiết, tránh N+1)
        var result = await query
            .OrderBy(x => x.HoTen)
            .Select(x => new NhanVienLookupDto
            {
                Id = x.Id,
                MaNhanVien = x.Username,
                HoTen = x.HoTen,
                ChucVu = x.ChucVu != null ? x.ChucVu.TenChucVu : (x.ChuyenKhoa != "" ? x.ChuyenKhoa : "Nhân viên"),
                VaiTro = x.NhanVienVaiTro.Select(v => v.VaiTro.TenVaiTro).FirstOrDefault(),
                MaKhoa = x.NhanVienKhoa.Where(k => k.LaKhoaChinh).Select(k => (int?)k.MaKhoa).FirstOrDefault()
                         ?? x.NhanVienKhoa.Select(k => (int?)k.MaKhoa).FirstOrDefault(),
                TenKhoa = x.NhanVienKhoa.Where(k => k.LaKhoaChinh).Select(k => k.Khoa.Ten).FirstOrDefault()
                          ?? x.NhanVienKhoa.Select(k => k.Khoa.Ten).FirstOrDefault(),
                TrangThaiHoatDong = x.IsActive
            })
            .ToListAsync(cancellationToken);

        return result;
    }
}
