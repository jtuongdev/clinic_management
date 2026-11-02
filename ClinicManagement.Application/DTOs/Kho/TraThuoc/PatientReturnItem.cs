namespace ClinicManagement.Application.DTOs.Kho;

public sealed record PatientReturnItem(int ItemId, string BatchNumber, decimal Quantity, string Condition);
