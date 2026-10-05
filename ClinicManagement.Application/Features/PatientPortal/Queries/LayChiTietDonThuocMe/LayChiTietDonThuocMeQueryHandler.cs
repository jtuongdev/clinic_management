using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Prescription;

namespace ClinicManagement.Application.Features.PatientPortal.Queries.LayChiTietDonThuocMe
{
    public class LayChiTietDonThuocMeQueryHandler : IRequestHandler<LayChiTietDonThuocMeQuery, DonThuocDto?>
    {
        private readonly IBenhNhanRepository _benhNhanRepo;

        public LayChiTietDonThuocMeQueryHandler(IBenhNhanRepository benhNhanRepo)
        {
            _benhNhanRepo = benhNhanRepo;
        }

        public async Task<DonThuocDto?> Handle(LayChiTietDonThuocMeQuery request, CancellationToken cancellationToken)
        {
            var donThuoc = await _benhNhanRepo.GetPrescriptionDetailAsync(
                request.PatientId,
                request.PrescriptionId,
                cancellationToken);

            if (donThuoc == null)
            {
                return null;
            }

            return new DonThuocDto
            {
                Id = donThuoc.Id,
                NgayKe = donThuoc.NgayKe,
                TrangThai = donThuoc.TrangThai.ToString(),
                GhiChu = donThuoc.GhiChu,
                ChiTiet = donThuoc.ChiTietDonThuocs?
                    .Where(ct => !ct.IsDeleted)
                    .Select(ct => new ChiTietDonThuocDto
                    {
                        TenThuoc = ct.Item?.Ten ?? string.Empty,
                        DonViTinh = ct.Item?.DonViTinhCoBan ?? string.Empty,
                        SoLuongKe = ct.SoLuongKe,
                        SoLuongDaXuat = ct.SoLuongDaXuat,
                        LieuDung = ct.LieuDung,
                        TanSuat = ct.TanSuat,
                        SoNgay = ct.SoNgay,
                        HuongDan = ct.HuongDan,
                        DonGia = ct.DonGiaKe
                    })
                    .ToList() ?? new()
            };
        }
    }
}
