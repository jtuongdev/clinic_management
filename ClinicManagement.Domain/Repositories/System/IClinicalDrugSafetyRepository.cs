namespace ClinicManagement.Domain.Repositories.System;

public interface IClinicalDrugSafetyRepository
{
    Task<IReadOnlyList<(int Id, string Name, string Ingredient)>> GetMedicinesAsync(
        IReadOnlyCollection<int> medicineIds, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetPatientAllergiesAsync(
        int patientId, CancellationToken cancellationToken = default);
}
