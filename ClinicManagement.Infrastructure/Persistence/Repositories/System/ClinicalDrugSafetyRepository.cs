using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories.System;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Persistence.Repositories.System;

public sealed class ClinicalDrugSafetyRepository(ClinicDbContext context) : IClinicalDrugSafetyRepository
{
    public async Task<IReadOnlyList<(int Id, string Name, string Ingredient)>> GetMedicinesAsync(
        IReadOnlyCollection<int> medicineIds, CancellationToken cancellationToken = default)
    {
        var rows = await context.Items.AsNoTracking()
            .Where(x => medicineIds.Contains(x.Id) && x.IsActive)
            .Select(x => new { x.Id, x.Ten, x.HoatChat })
            .ToListAsync(cancellationToken);
        return rows.Select(x => (x.Id, x.Ten, x.HoatChat)).ToList();
    }

    public async Task<IReadOnlyList<string>> GetPatientAllergiesAsync(
        int patientId, CancellationToken cancellationToken = default)
        => await context.TienSuBenhs.AsNoTracking()
            .Where(x => x.MaBenhNhan == patientId && x.LoaiTienSu == LoaiTienSu.DI_UNG)
            .Select(x => x.Ten)
            .Where(x => x != "")
            .ToListAsync(cancellationToken);
}
