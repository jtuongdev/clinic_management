using ClinicManagement.Application.Features.Kho.Lenh;

namespace ClinicManagement.Application.Features.Kho.Queries.LayDuLieuInDonThuoc;

public sealed record LayDuLieuInDonThuocQuery(int PrescriptionId, int UserId) : KhoRequest(UserId);
