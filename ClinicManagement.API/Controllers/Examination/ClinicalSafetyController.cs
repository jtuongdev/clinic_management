using ClinicManagement.Application.DTOs.Medical;
using ClinicManagement.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    /// <summary>
    /// Phân hệ Khám bệnh & An toàn lâm sàng (Clinical Safety & AI Governance).
    /// Cung cấp dịch vụ kiểm tra tương tác thuốc tự động (Drug Interaction Check) hỗ trợ bác sĩ kê đơn an toàn.
    /// Route: /api/ai
    /// </summary>
    [ApiController]
    [Route("api/ai")]
    public sealed class ClinicalSafetyController : BaseController
    {
        private readonly IClinicalGovernanceService _clinicalGovernanceService;

        public ClinicalSafetyController(IClinicalGovernanceService clinicalGovernanceService)
        {
            _clinicalGovernanceService = clinicalGovernanceService;
        }

        /// <summary>
        /// Kiểm tra nguy cơ tương tác thuốc giữa các thuốc trong đơn và tiền sử dị ứng/bệnh lý của bệnh nhân.
        /// </summary>
        [HttpPost("drug-interaction-check")]
        public async Task<IActionResult> CheckDrugInteraction(
            [FromBody] DrugInteractionCheckRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _clinicalGovernanceService.CheckDrugInteractionAsync(
                request.PatientId,
                request.MedicineIds,
                request.Note,
                cancellationToken);

            return Success(result, result.Status == "SAFE" ? "Không phát hiện nguy cơ tương tác thuốc." : "Cảnh báo tương tác thuốc cần xác nhận lại.");
        }
    }
}
