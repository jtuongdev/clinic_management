using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.PatientBooking;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;

namespace ClinicManagement.Application.Features.PatientBooking.Queries.LayDanhSachBacSiBooking
{
    public class LayDanhSachBacSiBookingQuery : IRequest<List<BookingDoctorDto>>
    {
        public int? MaKhoa { get; set; }
        public int? MaCoSo { get; set; }
    }

    public class LayDanhSachBacSiBookingQueryHandler : IRequestHandler<LayDanhSachBacSiBookingQuery, List<BookingDoctorDto>>
    {
        private readonly INhanVienRepository _nhanVienRepo;
        private readonly IKhoaRepository _khoaRepo;

        public LayDanhSachBacSiBookingQueryHandler(INhanVienRepository nhanVienRepo, IKhoaRepository khoaRepo)
        {
            _nhanVienRepo = nhanVienRepo;
            _khoaRepo = khoaRepo;
        }

        public async Task<List<BookingDoctorDto>> Handle(LayDanhSachBacSiBookingQuery request, CancellationToken cancellationToken)
        {
            int maCoSo = request.MaCoSo ?? 1;
            var doctorModels = new List<BacSiKhoaModel>();

            if (request.MaKhoa.HasValue && request.MaKhoa.Value > 0)
            {
                doctorModels = await _nhanVienRepo.GetBacSiByKhoaAsync(request.MaKhoa.Value, maCoSo, cancellationToken);
            }
            else
            {
                var khoas = await _khoaRepo.GetKhoasByCoSoAsync(maCoSo);
                var seenIds = new HashSet<int>();

                foreach (var khoa in khoas)
                {
                    var doctorsInKhoa = await _nhanVienRepo.GetBacSiByKhoaAsync(khoa.Id, maCoSo, cancellationToken);
                    foreach (var doc in doctorsInKhoa)
                    {
                        if (seenIds.Add(doc.NhanVien.Id))
                        {
                            doctorModels.Add(doc);
                        }
                    }
                }
            }

            return doctorModels.Select(m =>
            {
                var nv = m.NhanVien;
                var currentKhoa = nv.NhanVienKhoa?.FirstOrDefault(k => k.DenNgay == null)?.Khoa;

                return new BookingDoctorDto
                {
                    Id = nv.Id,
                    HoTen = nv.HoTen ?? string.Empty,
                    ChuyenKhoa = nv.ChuyenKhoa ?? currentKhoa?.Ten ?? "Bác sĩ chuyên khoa",
                    HocHamHocVi = nv.ChucVu?.TenChucVu,
                    SoHanhNghe = nv.SoHanhNghe ?? string.Empty,
                    Email = nv.Email ?? string.Empty,
                    DienThoai = nv.DienThoai ?? string.Empty,
                    MaKhoa = currentKhoa?.Id ?? request.MaKhoa,
                    TenKhoa = currentKhoa?.Ten,
                    MaCoSo = maCoSo,
                    DangTruc = m.DangTruc,
                    AvatarUrl = null,
                    MoTa = $"Bác sĩ {nv.HoTen} - {nv.ChuyenKhoa ?? currentKhoa?.Ten}"
                };
            }).ToList();
        }
    }
}
