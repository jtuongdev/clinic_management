# 1. Chi tiết thay đổi đã triển khai

## 1.1. Ma trận quyền lưu bằng database

| Thành phần | File |
|---|---|
| Entity quyền | `ClinicManagement.Domain/System/RolePermissionMatrix.cs` |
| Interface repository | `ClinicManagement.Domain/Repositories/System/IRolePermissionMatrixRepository.cs` |
| Repository EF Core | `ClinicManagement.Infrastructure/Persistence/Repositories/System/RolePermissionMatrixRepository.cs` |
| Fluent configuration | `ClinicManagement.Infrastructure/Persistence/Configurations/RolePermissionMatrixConfiguration.cs` |
| Đăng ký DI | `ClinicManagement.Infrastructure/DependencyInjection.cs` |

Bảng `RolePermissionMatrix` lưu `RoleId`, `Module`, `Action`, `DataScope` và `IsAllowed`, với khóa duy nhất trên `RoleId + Module + Action`.

`ClinicalGovernanceService` hiện:

- Đọc ma trận quyền từ repository EF Core.
- Lưu/cập nhật quyền theo `RoleId`.
- Thay thế toàn bộ permission của vai trò khi cập nhật.
- Chỉ dùng ma trận mặc định khi database chưa có dữ liệu.
- Không còn bypass chỉ vì tên vai trò chứa `Admin`.

## 1.2. Authorization tại API layer

File thực hiện: `ClinicManagement.API/Authorization/ClinicalAuthorizeAttribute.cs`

Ví dụ:

```csharp
[ClinicalAuthorize("settings", PermissionAction.EDIT, DataScope.ALL_FACILITIES)]
```

Filter kiểm tra JWT claim `sub` hoặc `userId`, role đang hoạt động, module/action và scope. Không có claim trả `401`; có user nhưng không có quyền trả `403`.

## 1.3. Audit trail export

Đã thêm vào `AdminSettingsController`:

```http
GET /api/admin/audit-logs/export
```

Hỗ trợ lọc `patientId`, `userId`, `action`, `from`, `to`. Đầu ra là CSV UTF-8, tối đa 10.000 bản ghi/lần xuất.

## 1.4. Clinical transaction API

Đã thêm:

`ClinicManagement.API/Controllers/ClinicalTransactionsController.cs`

```http
GET  /api/clinical/transactions/{visitId}/summary
POST /api/clinical/transactions/{visitId}/validate
```

Summary gồm lượt khám, bệnh nhân, trạng thái, chẩn đoán/ICD, chỉ định dịch vụ, đơn thuốc và validation hoàn tất.

## 1.5. Migration

| Migration | Nội dung |
|---|---|
| `20260916122023_AddGovernanceAuditAndIntegrationSettings` | `EmrAuditLog`, `IntegrationSetting` |
| `20260916122459_ThemMaTranQuyenVaScope` | `RolePermissionMatrix` và khóa ngoại tới `VaiTro` |

## 1.6. Chuẩn hóa Billing

| Tên cũ | Tên mới |
|---|---|
| `BillingCommands.cs` | `CacLenhVienPhi.cs` |
| `BillingQueries.cs` | `CacTruyVanVienPhi.cs` |
| `BillingMapper.cs` | `AnhXaVienPhi.cs` |

Các command/query riêng trong `Commands` và `Queries` vẫn được giữ tách file theo pattern module Kho.