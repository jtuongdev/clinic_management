namespace ClinicManagement.Application.DTOs.Medical
{
    public sealed record DrugInteractionCheckRequest(
        int PatientId,
        List<int> MedicineIds,
        string? Note = null);

    public sealed record DrugInteractionAlert(
        int MedicineId,
        string Severity,
        string Message,
        string[] MatchedIngredients,
        bool BlockPrescription);

    public sealed record DrugInteractionCheckResponse(
        bool IsSafe,
        string Status,
        List<DrugInteractionAlert> Alerts,
        string Summary);

    public sealed record LockEmrRequest(
        string? LyDo,
        string? ChuKySo = null);

    public sealed record LockEmrResponse(
        int RecordId,
        string Signature,
        bool Locked,
        string Message);
}
