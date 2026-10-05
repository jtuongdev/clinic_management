using MediatR;
using ClinicManagement.Application.DTOs.BenhNhan;

namespace ClinicManagement.Application.Features.PatientPortal.Queries.LayChiTietDonThuocMe
{
    public class LayChiTietDonThuocMeQuery : IRequest<DonThuocDto?>
    {
        public int PatientId { get; set; }
        public int PrescriptionId { get; set; }
    }
}
