using ClinicManagement.Application.DTOs.Admin;
using ClinicManagement.Application.DTOs.Medical;
using ClinicManagement.Application.DTOs.System;
using ClinicManagement.Application.Services.Interfaces;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Repositories.System;
using ClinicManagement.Domain.System;

namespace ClinicManagement.Application.Services
{
    public sealed class ClinicalGovernanceService : IClinicalGovernanceService
    {
        private readonly ILuotKhamRepository _luotKhamRepository;
        private readonly INhatKyHoSoBenhAnRepository _nhatKyHoSoBenhAnRepository;
        private readonly ICauHinhTichHopRepository _cauHinhTichHopRepository;
        private readonly IClinicalAccessRepository _clinicalAccessRepository;
        private readonly IMaTranPhanQuyenRepository _maTranPhanQuyenRepository;
        private readonly IClinicalDrugSafetyRepository _clinicalDrugSafetyRepository;

        private static readonly List<RolePermissionMatrixDto> DefaultRoleMatrix =
        [
            new(
                1,
                "ADMIN",
                "Quản trị viên",
                "Toàn quyền quản trị hệ thống",
                PhamViDuLieu.TOAN_HE_THONG,
                new Dictionary<string, List<HanhDongQuyen>>
                {
                    ["patient"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET],
                    ["examination"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET],
                    ["cls"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET],
                    ["inventory"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET],
                    ["billing"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET],
                    ["audit"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET],
                    ["settings"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET],
                    ["hr"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.XOA, HanhDongQuyen.DUYET]
                }),
            new(
                2,
                "DOCTOR",
                "Bác sĩ khám bệnh",
                "Khám bệnh, chỉ định CLS, kê đơn thuốc, chẩn đoán",
                PhamViDuLieu.KHOA_PHONG,
                new Dictionary<string, List<HanhDongQuyen>>
                {
                    ["patient"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA],
                    ["examination"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.DUYET],
                    ["cls"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA],
                    ["inventory"] = [HanhDongQuyen.XEM],
                    ["billing"] = [HanhDongQuyen.XEM],
                    ["audit"] = [HanhDongQuyen.XEM],
                    ["hr"] = [HanhDongQuyen.XEM]
                }),
            new(
                3,
                "PHARMACIST",
                "Dược sĩ",
                "Quản lý kho, cấp phát thuốc, nhập xuất tồn",
                PhamViDuLieu.CO_SO,
                new Dictionary<string, List<HanhDongQuyen>>
                {
                    ["patient"] = [HanhDongQuyen.XEM],
                    ["examination"] = [HanhDongQuyen.XEM],
                    ["inventory"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA, HanhDongQuyen.DUYET],
                    ["billing"] = [HanhDongQuyen.XEM]
                }),
            new(
                4,
                "NURSE",
                "Điều dưỡng",
                "Tiếp nhận bệnh nhân, ghi nhận sinh hiệu, hỗ trợ khám",
                PhamViDuLieu.KHOA_PHONG,
                new Dictionary<string, List<HanhDongQuyen>>
                {
                    ["patient"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA],
                    ["examination"] = [HanhDongQuyen.XEM, HanhDongQuyen.SUA],
                    ["cls"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO],
                    ["inventory"] = [HanhDongQuyen.XEM]
                }),
            new(
                5,
                "RECEPTIONIST",
                "Tiếp đón",
                "Tiếp nhận bệnh nhân, xếp hàng đợi, thu ngân",
                PhamViDuLieu.CO_SO,
                new Dictionary<string, List<HanhDongQuyen>>
                {
                    ["patient"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO, HanhDongQuyen.SUA],
                    ["examination"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO],
                    ["billing"] = [HanhDongQuyen.XEM, HanhDongQuyen.TAO]
                })
        ];

        public ClinicalGovernanceService(
            ILuotKhamRepository luotKhamRepository,
            INhatKyHoSoBenhAnRepository nhatKyHoSoBenhAnRepository,
            ICauHinhTichHopRepository cauHinhTichHopRepository,
            IClinicalAccessRepository clinicalAccessRepository,
            IMaTranPhanQuyenRepository maTranPhanQuyenRepository,
            IClinicalDrugSafetyRepository clinicalDrugSafetyRepository)
        {
            _luotKhamRepository = luotKhamRepository;
            _nhatKyHoSoBenhAnRepository = nhatKyHoSoBenhAnRepository;
            _cauHinhTichHopRepository = cauHinhTichHopRepository;
            _clinicalAccessRepository = clinicalAccessRepository;
            _maTranPhanQuyenRepository = maTranPhanQuyenRepository;
            _clinicalDrugSafetyRepository = clinicalDrugSafetyRepository;
        }

        public async Task<IReadOnlyList<RolePermissionMatrixDto>> GetRoleMatrixAsync(CancellationToken cancellationToken = default)
        {
            var rows = await _maTranPhanQuyenRepository.GetAllAsync(cancellationToken);
            if (rows.Count == 0)
                return DefaultRoleMatrix;

            var roleNames = await _clinicalAccessRepository.GetRoleNamesByIdsAsync(
                rows.Select(x => x.MaVaiTro).Distinct().ToArray(), cancellationToken);
            return rows.GroupBy(x => x.MaVaiTro).Select(group =>
            {
                var roleName = roleNames.TryGetValue(group.Key, out var name) ? name : $"ROLE_{group.Key}";
                return new RolePermissionMatrixDto(
                    group.Key,
                    roleName.ToUpperInvariant().Replace(' ', '_'),
                    roleName,
                    "Ma tran quyen luu trong co so du lieu",
                    group.Select(x => x.PhamViDuLieu).Distinct().FirstOrDefault(),
                    group.GroupBy(x => x.PhanHe).ToDictionary(
                        x => x.Key,
                        x => x.Select(permission => permission.HanhDong).Distinct().ToList()));
            })
                .ToList();
        }

        public async Task<RolePermissionMatrixDto> SaveRoleMatrixAsync(UpdateRolePermissionRequest request, CancellationToken cancellationToken = default)
        {
            if (request is null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.MaCode))
                throw new ArgumentException("Mã vai trò không được để trống.");

            if (request.Id <= 0)
                throw new ArgumentException("Id vai tro khong hop le.");

            var phanQuyen = request.PhanQuyen.ToDictionary(
                x => x.Key,
                x => (IReadOnlyCollection<HanhDongQuyen>)x.Value.Distinct().ToArray());
            await _maTranPhanQuyenRepository.ReplaceRoleAsync(
                request.Id, phanQuyen, request.PhamViDuLieu, cancellationToken);

            return new RolePermissionMatrixDto(
                request.Id, request.MaCode.Trim(), request.Ten.Trim(), request.MoTa?.Trim() ?? string.Empty,
                request.PhamViDuLieu, request.PhanQuyen);
        }

        public async Task<bool> HasPermissionAsync(
            int maNguoiDung,
            string phanHe,
            string hanhDong,
            PhamViDuLieu phamViDuLieu = PhamViDuLieu.KHOA_PHONG,
            IReadOnlyList<string>? userRoles = null,
            CancellationToken cancellationToken = default)
        {
            var normalizedPhanHe = (phanHe ?? string.Empty).Trim().ToLowerInvariant();
            var normalizedHanhDong = (hanhDong ?? string.Empty).Trim().ToUpperInvariant();

            if (maNguoiDung <= 0 || string.IsNullOrWhiteSpace(normalizedPhanHe) || string.IsNullOrWhiteSpace(normalizedHanhDong))
                return false;

            var roleNames = (await _clinicalAccessRepository.GetRoleNamesByUserAsync(maNguoiDung, cancellationToken)).ToList();
            if (userRoles != null && userRoles.Count > 0)
            {
                foreach (var r in userRoles)
                {
                    if (!string.IsNullOrWhiteSpace(r) && !roleNames.Contains(r, StringComparer.OrdinalIgnoreCase))
                        roleNames.Add(r);
                }
            }

            if (roleNames.Count == 0)
                return false;

            var roleIds = await _clinicalAccessRepository.GetRoleIdsByUserAsync(maNguoiDung, cancellationToken);
            var permissions = await _maTranPhanQuyenRepository.GetByMaVaiTroIdsAsync(roleIds, cancellationToken);
            var requestedAction = Enum.TryParse<HanhDongQuyen>(normalizedHanhDong, true, out var parsedAction)
                ? parsedAction
                : (HanhDongQuyen?)null;

            if (requestedAction.HasValue && permissions.Count > 0)
            {
                var match = permissions.FirstOrDefault(x => x.PhanHe == normalizedPhanHe && x.HanhDong == requestedAction.Value);
                if (match != null)
                {
                    bool scopeAllowed = IsScopeAllowed(match.PhamViDuLieu, phamViDuLieu);
                    if (match.DuocPhep && scopeAllowed) return true;
                }
            }

            // Fallback: Nếu DB chưa có phân quyền hoặc chưa cấu hình cho phân hệ này của vai trò,
            // đối chiếu với ma trận vai trò mặc định (DefaultRoleMatrix).
            return DefaultRoleMatrix
                .Where(role => roleNames.Any(name => IsRoleMatching(name, role)))
                .SelectMany(role => role.PhanQuyen)
                .Any(x => string.Equals(x.Key, normalizedPhanHe, StringComparison.OrdinalIgnoreCase)
                    && x.Value.Any(value => string.Equals(value.ToString(), normalizedHanhDong, StringComparison.OrdinalIgnoreCase)));
        }

        private static bool IsRoleMatching(string userRole, RolePermissionMatrixDto matrixRole)
        {
            if (string.IsNullOrWhiteSpace(userRole)) return false;
            var u = userRole.Trim().ToUpperInvariant();
            var code = matrixRole.MaCode.Trim().ToUpperInvariant();
            var name = matrixRole.Ten.Trim().ToUpperInvariant();

            if (u.Contains(code) || code.Contains(u) || u.Contains(name) || name.Contains(u))
                return true;

            // Doctor aliases (BAC_SI_KHAM_BENH, BAC_SI, DOCTOR, Bác sĩ, etc.)
            if (code == "DOCTOR" || code.Contains("BAC_SI") || name.Contains("BÁC SĨ"))
            {
                if (u.Contains("DOCTOR") || u.Contains("BAC_SI") || u.Contains("BACSI") || u.Contains("BÁC SĨ") || u.Contains("KHAM_BENH") || u.Contains("DIEU_TRI"))
                    return true;
            }

            // Admin aliases
            if (code == "ADMIN" || code.Contains("QUAN_TRI") || name.Contains("QUẢN TRỊ"))
            {
                if (u.Contains("ADMIN") || u.Contains("QUAN_TRI") || u.Contains("QUẢN TRỊ") || u.Contains("SUPER"))
                    return true;
            }

            // Pharmacist aliases
            if (code == "PHARMACIST" || code.Contains("DUOC_SI") || name.Contains("DƯỢC SĨ"))
            {
                if (u.Contains("PHARMACIST") || u.Contains("DUOC_SI") || u.Contains("DƯỢC SĨ") || u.Contains("DUOCSI") || u.Contains("KHO_DUOC"))
                    return true;
            }

            // Nurse aliases
            if (code == "NURSE" || code.Contains("DIEU_DUONG") || name.Contains("ĐIỀU DƯỠNG"))
            {
                if (u.Contains("NURSE") || u.Contains("DIEU_DUONG") || u.Contains("ĐIỀU DƯỠNG") || u.Contains("Y_TA"))
                    return true;
            }

            // Receptionist aliases
            if (code == "RECEPTIONIST" || code.Contains("TIEP_DON") || name.Contains("TIẾP ĐÓN"))
            {
                if (u.Contains("RECEPTIONIST") || u.Contains("TIEP_DON") || u.Contains("TIẾP ĐÓN") || u.Contains("LE_TAN"))
                    return true;
            }

            return false;
        }

        private static bool IsScopeAllowed(PhamViDuLieu granted, PhamViDuLieu requested)
        {
            if (granted == PhamViDuLieu.TOAN_HE_THONG) return true;
            if (granted == requested) return true;
            if (granted == PhamViDuLieu.CO_SO)
            {
                return requested == PhamViDuLieu.CO_SO 
                    || requested == PhamViDuLieu.CHI_NHANH 
                    || requested == PhamViDuLieu.KHOA_PHONG;
            }
            if (granted == PhamViDuLieu.CHI_NHANH)
            {
                return requested == PhamViDuLieu.CHI_NHANH 
                    || requested == PhamViDuLieu.KHOA_PHONG;
            }
            return false;
        }

        public async Task<DrugInteractionCheckResponse> CheckDrugInteractionAsync(int maBenhNhan, IEnumerable<int> medicineIds, string? note = null, CancellationToken cancellationToken = default)
        {
            var list = medicineIds.Where(x => x > 0).Distinct().ToList();
            if (list.Count == 0)
                return new DrugInteractionCheckResponse(true, "SAFE", [], "Không có thuốc nào được chỉ định.");

            var alerts = new List<DrugInteractionAlert>();
            var medicines = await _clinicalDrugSafetyRepository.GetMedicinesAsync(list, cancellationToken);
            var allergies = await _clinicalDrugSafetyRepository.GetPatientAllergiesAsync(maBenhNhan, cancellationToken);
            foreach (var medicine in medicines)
            {
                var matched = allergies.Where(a =>
                    medicine.Ingredient.Contains(a, StringComparison.OrdinalIgnoreCase)
                    || medicine.Name.Contains(a, StringComparison.OrdinalIgnoreCase)
                    || a.Contains(medicine.Ingredient, StringComparison.OrdinalIgnoreCase))
                    .Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
                if (matched.Length > 0)
                    alerts.Add(new DrugInteractionAlert(medicine.Id, "CRITICAL",
                        $"Thuốc {medicine.Name} có thể gây phản ứng với tiền sử dị ứng của bệnh nhân.",
                        matched, true));
            }

            var ingredientGroups = medicines.Where(x => !string.IsNullOrWhiteSpace(x.Ingredient))
                .GroupBy(x => x.Ingredient.Trim(), StringComparer.OrdinalIgnoreCase);
            foreach (var group in ingredientGroups.Where(x => x.Count() > 1))
            {
                foreach (var medicine in group)
                    alerts.Add(new DrugInteractionAlert(medicine.Id, "WARNING",
                        "Đơn thuốc có thuốc trùng hoạt chất.", [group.Key], false));
            }

            var isSafe = alerts.Count == 0;
            var summary = isSafe ? "An toàn về tương tác thuốc." : "Cần kiểm tra lại trước khi lưu đơn thuốc.";
            return new DrugInteractionCheckResponse(isSafe, isSafe ? "SAFE" : "WARNING", alerts, summary);
        }

        public Task<LockEmrResponse> LockEmrAsync(int maHoSo, int maNguoiDung, string? lyDo, string? chuKySo, CancellationToken cancellationToken = default)
        {
            if (maHoSo <= 0)
                throw new ArgumentException("ID hồ sơ không hợp lệ.");

            if (string.IsNullOrWhiteSpace(lyDo))
                throw new ArgumentException("Bắt buộc phải nhập lý do khám trước khi khóa hồ sơ.");

            return LockEmrInternalAsync(maHoSo, maNguoiDung, lyDo, chuKySo, cancellationToken);
        }

        private async Task<LockEmrResponse> LockEmrInternalAsync(
            int maHoSo, int maNguoiDung, string lyDo, string? chuKySo, CancellationToken cancellationToken)
        {
            var visit = await _luotKhamRepository.GetDetailByIdAsync(maHoSo, cancellationToken)
                ?? throw new KeyNotFoundException("Không tìm thấy lượt khám.");
            var signature = string.IsNullOrWhiteSpace(chuKySo)
                ? $"SIG_{DateTime.UtcNow:yyyyMMddHHmmss}_{maNguoiDung}_{maHoSo}"
                : chuKySo.Trim();
            visit.LockEmr(signature, maNguoiDung);
            _luotKhamRepository.Update(visit);
            await _luotKhamRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            await WriteAuditLogAsync(new CreateEmrAuditLogRequest(
                visit.MaBenhNhan, maHoSo, maNguoiDung, "SIGN", "EMR", string.Empty, lyDo), cancellationToken);
            return new LockEmrResponse(maHoSo, signature, true, "Khóa hồ sơ thành công. Hồ sơ chỉ đọc sau khi ký số.");
        }

        public async Task<ClinicalRecordValidationResult> ValidateClinicalRecordCompletionAsync(int maHoSo, CancellationToken cancellationToken = default)
        {
            var visit = await _luotKhamRepository.GetForCompletionAsync(maHoSo, cancellationToken);

            if (visit is null)
            {
                return new ClinicalRecordValidationResult(false, "Không tìm thấy lượt khám.", ["Không tìm thấy lượt khám."], []);
            }

            var errors = new List<string>();
            var warnings = new List<string>();

            if (string.IsNullOrWhiteSpace(visit.LyDoKham))
                errors.Add("Bắt buộc phải nhập lý do khám trước khi hoàn tất lượt khám.");

            if (visit.TrangThai != Domain.Common.Enums.TrangThaiLuotKham.DANG_KHAM)
                errors.Add("Lượt khám phải đang ở trạng thái ĐANG_KHAM để thực hiện hoàn tất.");

            if (!visit.ChanDoans.Any(x => x.LaChanDoanChinh || !string.IsNullOrWhiteSpace(x.MaICD)))
                errors.Add("Bắt buộc phải có ít nhất 1 chẩn đoán chính hoặc ICD hợp lệ trước khi hoàn tất.");

            if (visit.ChanDoans.Count == 0)
                warnings.Add("Chưa có chẩn đoán nào được ghi nhận trên hồ sơ.");

            if (errors.Count == 0)
                return new ClinicalRecordValidationResult(true, "Lượt khám đạt điều kiện hoàn tất.", [], warnings);

            return new ClinicalRecordValidationResult(false, "Lượt khám chưa đạt điều kiện hoàn tất.", errors, warnings);
        }

        public async Task<IReadOnlyList<EmrAuditLogDto>> GetAuditLogsAsync(
            int? maBenhNhan = null,
            int? maNguoiDung = null,
            string? hanhDong = null,
            string? phanHe = null,
            DateTime? from = null,
            DateTime? to = null,
            int pageIndex = 1,
            int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            var logs = await _nhatKyHoSoBenhAnRepository.GetByFilterAsync(maBenhNhan, maNguoiDung, hanhDong, phanHe, from, to, pageIndex, pageSize, cancellationToken);
            return logs
                .Select(x => new EmrAuditLogDto(x.Id, x.MaBenhNhan, x.MaHoSo, x.MaNguoiDung, x.HanhDong, x.PhanHe, x.DiaChiIp, x.ThoiGian, x.ChiTiet, x.TrangThai))
                .ToList();
        }

        public async Task<EmrAuditLogDto> WriteAuditLogAsync(CreateEmrAuditLogRequest request, CancellationToken cancellationToken = default)
        {
            if (request is null)
                throw new ArgumentNullException(nameof(request));

            if (request.MaBenhNhan <= 0)
                throw new ArgumentException("MaBenhNhan không hợp lệ.");

            if (request.MaHoSo <= 0)
                throw new ArgumentException("MaHoSo không hợp lệ.");

            if (request.MaNguoiDung <= 0)
                throw new ArgumentException("MaNguoiDung không hợp lệ.");

            if (string.IsNullOrWhiteSpace(request.HanhDong))
                throw new ArgumentException("HanhDong không được để trống.");

            var entity = new NhatKyHoSoBenhAn
            {
                MaBenhNhan = request.MaBenhNhan,
                MaHoSo = request.MaHoSo,
                MaNguoiDung = request.MaNguoiDung,
                HanhDong = request.HanhDong,
                PhanHe = string.IsNullOrWhiteSpace(request.PhanHe) ? "EMR" : request.PhanHe,
                DiaChiIp = string.IsNullOrWhiteSpace(request.DiaChiIp) ? "127.0.0.1" : request.DiaChiIp,
                ThoiGian = DateTime.UtcNow,
                ChiTiet = request.ChiTiet,
                TrangThai = string.IsNullOrWhiteSpace(request.TrangThai) ? "THANH_CONG" : request.TrangThai
            };

            var saved = await _nhatKyHoSoBenhAnRepository.AddAsync(entity, cancellationToken);
            return new EmrAuditLogDto(saved.Id, saved.MaBenhNhan, saved.MaHoSo, saved.MaNguoiDung, saved.HanhDong, saved.PhanHe, saved.DiaChiIp, saved.ThoiGian, saved.ChiTiet, saved.TrangThai);
        }

        public async Task<IReadOnlyList<IntegrationSettingDto>> GetIntegrationSettingsAsync(string? danhMuc = null, CancellationToken cancellationToken = default)
        {
            var items = await _cauHinhTichHopRepository.GetByCategoryAsync(danhMuc, cancellationToken);
            return items
                .Select(x => new IntegrationSettingDto(x.Id, x.DanhMuc, x.MaCode, x.Ten, x.GiaTri, x.MoTa, x.DaMaHoa, x.NguoiCapNhat, x.ThoiGianCapNhat))
                .ToList();
        }

        public async Task<IntegrationSettingDto> UpsertIntegrationSettingAsync(UpsertIntegrationSettingRequest request, int? nguoiThucHien = null, CancellationToken cancellationToken = default)
        {
            if (request is null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.DanhMuc))
                throw new ArgumentException("DanhMuc không được để trống.");

            if (string.IsNullOrWhiteSpace(request.MaCode))
                throw new ArgumentException("MaCode không được để trống.");

            var entity = new CauHinhTichHop
            {
                DanhMuc = request.DanhMuc.Trim(),
                MaCode = request.MaCode.Trim(),
                Ten = string.IsNullOrWhiteSpace(request.Ten) ? request.MaCode.Trim() : request.Ten.Trim(),
                GiaTri = request.GiaTri,
                MoTa = request.MoTa,
                DaMaHoa = request.DaMaHoa,
                NguoiCapNhat = nguoiThucHien,
                ThoiGianCapNhat = DateTime.UtcNow
            };

            var saved = await _cauHinhTichHopRepository.UpsertAsync(entity, cancellationToken);
            return new IntegrationSettingDto(saved.Id, saved.DanhMuc, saved.MaCode, saved.Ten, saved.GiaTri, saved.MoTa, saved.DaMaHoa, saved.NguoiCapNhat, saved.ThoiGianCapNhat);
        }
    }
}
