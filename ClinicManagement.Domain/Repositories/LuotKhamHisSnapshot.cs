using System.Collections.Generic;

namespace ClinicManagement.Domain.Repositories;

public sealed record LuotKhamHisSnapshot(
    bool LaHoanThanh,
    IReadOnlyList<ClsDichVuSnapshot> DichVus);

public sealed record ClsDichVuSnapshot(
    decimal Gia,
    decimal TyLeHoaHong);
