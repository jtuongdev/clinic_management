namespace ClinicManagement.Application.DTOs.Kho;

public sealed record PatientReturnRequest(int PrescriptionId, IEnumerable<PatientReturnItem> Items, string Reason, string IdempotencyKey);
