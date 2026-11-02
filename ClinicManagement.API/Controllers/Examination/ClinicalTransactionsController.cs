using ClinicManagement.API.Authorization;
using ClinicManagement.API.Controllers;
using ClinicManagement.Application.Services.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers;

/// <summary>
/// Phân hệ Khám bệnh & Giao dịch lâm sàng (Clinical Transactions Governance).
/// Cung cấp tóm tắt giao dịch lâm sàng tổng hợp và thẩm định điều kiện nghiệp vụ để duyệt hoàn tất hồ sơ.
/// Route: /api/clinical/transactions
/// </summary>
[ApiController]
[Route("api/clinical/transactions")]
public sealed class ClinicalTransactionsController(
    ILuotKhamRepository luotKhamRepository,
    IClinicalGovernanceService governance) : BaseController
{
    /// <summary>
    /// Lấy tóm tắt tổng hợp giao dịch lâm sàng của lượt khám (chẩn đoán, dịch vụ, đơn thuốc, trạng thái hợp lệ).
    /// </summary>
    [HttpGet("{visitId:int}/summary")]
    [ClinicalAuthorize("examination", HanhDongQuyen.XEM)]
    public async Task<IActionResult> GetSummary(int visitId, CancellationToken cancellationToken)
    {
        var visit = await luotKhamRepository.GetDetailByIdAsync(visitId, cancellationToken);
        if (visit is null)
            return Failure("Khong tim thay luot kham.", 404);

        var validation = await governance.ValidateClinicalRecordCompletionAsync(visitId, cancellationToken);
        return Success(new
        {
            visitId = visit.Id,
            patientId = visit.MaBenhNhan,
            status = visit.TrangThai.ToString(),
            examinationDate = visit.NgayKham,
            diagnoses = visit.ChanDoans.Select(x => new { x.MaICD, x.TenChanDoan, x.LaChanDoanChinh }),
            services = visit.ChiDinhDichVus.Select(x => new { x.Id, x.MaDanhMuc, status = x.TrangThai.ToString() }),
            prescriptions = visit.DonThuocs.Select(x => new { x.Id, x.NgayKe, status = x.TrangThai.ToString() }),
            completion = validation
        });
    }

    /// <summary>
    /// Thẩm định và kiểm tra điều kiện nghiệp vụ hồ sơ lâm sàng có đủ tiêu chuẩn hoàn tất/duyệt hay không.
    /// </summary>
    [HttpPost("{visitId:int}/validate")]
    [ClinicalAuthorize("examination", HanhDongQuyen.DUYET)]
    public async Task<IActionResult> Validate(int visitId, CancellationToken cancellationToken)
    {
        var result = await governance.ValidateClinicalRecordCompletionAsync(visitId, cancellationToken);
        return Success(result, result.IsValid
            ? "Ho so du dieu kien nghiep vu."
            : "Ho so chua du dieu kien nghiep vu.");
    }
}
