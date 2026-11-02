namespace ClinicManagement.Application.DTOs.Medical
{
    public sealed record ClinicalRecordValidationResult(
        bool IsValid,
        string Message,
        List<string> Errors,
        List<string> Warnings = null!
    );
}
