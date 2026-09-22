using ClinicManagement.Application.DTOs.Medical;
using ClinicManagement.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.API.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public sealed class ClinicalSafetyController : BaseController
    {
        private readonly IClinicalGovernanceService _clinicalGovernanceService;

        public ClinicalSafetyController(IClinicalGovernanceService clinicalGovernanceService)
        {
            _clinicalGovernanceService = clinicalGovernanceService;
        }

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
