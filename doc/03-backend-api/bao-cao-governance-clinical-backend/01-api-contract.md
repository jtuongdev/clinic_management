# 01. API Contract & Endpoint Detail

## 1. Endpoint Admin Management

### 1.1. Quản lý role matrix

| Method | Endpoint | Mô tả | Request | Response |
|---|---|---|---|---|
| GET | `/api/admin/roles` | Lấy ma trận quyền theo module/action | Không cần body | `IReadOnlyList<RolePermissionMatrixDto>` |
| POST | `/api/admin/roles` | Cập nhật ma trận quyền | `UpdateRolePermissionRequest` | `RolePermissionMatrixDto` |

#### Request model

```csharp
public sealed record UpdateRolePermissionRequest(
    int Id,
    string Code,
    string Name,
    string Description,
    DataScope DataScope,
    Dictionary<string, List<PermissionAction>> Permissions);
```

#### Response model

```csharp
public sealed record RolePermissionMatrixDto(
    int Id,
    string Code,
    string Name,
    string Description,
    DataScope DataScope,
    Dictionary<string, List<PermissionAction>> Permissions);
```

### 1.2. Audit log

| Method | Endpoint | Mô tả | Request | Response |
|---|---|---|---|---|
| GET | `/api/admin/audit-logs` | Truy vấn log theo time/user/action | Query string | `IReadOnlyList<EmrAuditLogDto>` |
| POST | `/api/admin/audit-logs` | Ghi log mới | `CreateEmrAuditLogRequest` | `EmrAuditLogDto` |

#### Request model

```csharp
public sealed record CreateEmrAuditLogRequest(
    int PatientId,
    int RecordId,
    int UserId,
    string Action,
    string Module,
    string IpAddress,
    string Details,
    string Status = "SUCCESS");
```

### 1.3. Integration settings

| Method | Endpoint | Mô tả | Request | Response |
|---|---|---|---|---|
| GET | `/api/admin/integration-config` | Lấy cấu hình tích hợp | Query `category` | `IReadOnlyList<IntegrationSettingDto>` |
| POST | `/api/admin/integration-config` | Upsert cấu hình | `UpsertIntegrationSettingRequest` | `IntegrationSettingDto` |

#### Request model

```csharp
public sealed record UpsertIntegrationSettingRequest(
    string Category,
    string Code,
    string Name,
    string Value,
    string? Description,
    bool IsEncrypted = false,
    int? UpdatedBy = null);
```

## 2. Endpoint Safety Check

### 2.1. Kiểm tra tương tác thuốc

| Method | Endpoint | Mô tả | Request | Response |
|---|---|---|---|---|
| POST | `/api/ai/drug-interaction-check` | Kiểm tra tương tác thuốc giữa các thuốc đã kê | `DrugInteractionCheckRequest` | `DrugInteractionCheckResponse` |

#### Request model

```csharp
public sealed record DrugInteractionCheckRequest(
    int PatientId,
    List<int> MedicineIds,
    string? Note = null);
```

#### Response model

```csharp
public sealed record DrugInteractionCheckResponse(
    bool IsSafe,
    string Status,
    List<DrugInteractionAlert> Alerts,
    string Summary);
```

#### Alert model

```csharp
public sealed record DrugInteractionAlert(
    int MedicineId,
    string Severity,
    string Message,
    string[] MatchedIngredients,
    bool BlockPrescription);
```

## 3. Endpoint EMR Lock

| Method | Endpoint | Mô tả | Request | Response |
|---|---|---|---|---|
| POST | `/api/luot-kham/{id}/emr/lock` | Khóa hồ sơ EMR sau khi ký số | `LockEmrRequest` | `LockEmrResponse` |

#### Request model

```csharp
public sealed record LockEmrRequest(
    string? LyDo,
    string? ChuKySo = null);
```

#### Response model

```csharp
public sealed record LockEmrResponse(
    int RecordId,
    string Signature,
    bool Locked,
    string Message);
```

## 4. Business contract alignment với Frontend

### DoctorUI

- `examinationApi.checkDrugInteractions()` → `/api/ai/drug-interaction-check`
- `examinationApi.lockEmr()` → `/api/luot-kham/{id}/emr/lock`
- `examinationApi.completeExam()` → `/api/LuotKham/{id}/complete` (đã có sẵn)

### AdminUI

- `RoleManagementPage.jsx` → `/api/admin/roles`
- `AuditLogPage.jsx` → `/api/admin/audit-logs`
- `IntegrationConfigPage.jsx` → `/api/admin/integration-config`

## 5. Lưu ý implementation

- Contract hiện đang ở dạng service layer chuẩn hóa và có thể mount trực tiếp vào Controller.
- Chuẩn response theo envelope `Success(data, message)` từ `BaseController`.
- Cần thêm `Authorize` và policy kiểm tra role/module trong production.
