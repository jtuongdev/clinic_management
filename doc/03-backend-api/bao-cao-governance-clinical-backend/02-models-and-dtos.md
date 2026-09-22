# 02. Models & DTOs

## 1. Domain models

### 1.1. `DataScope`

```csharp
namespace ClinicManagement.Domain.Common.Enums
{
    public enum DataScope
    {
        ALL_FACILITIES = 1,
        FACILITY_ONLY = 2,
        DEPARTMENT_ONLY = 3,
        BRANCH = 4
    }
}
```

### 1.2. `PermissionAction`

```csharp
namespace ClinicManagement.Domain.Common.Enums
{
    public enum PermissionAction
    {
        VIEW = 1,
        CREATE = 2,
        EDIT = 3,
        DELETE = 4,
        APPROVE = 5
    }
}
```

### 1.3. `EmrAuditLog`

```csharp
public class EmrAuditLog : BaseEntity
{
    public int PatientId { get; set; }
    public int RecordId { get; set; }
    public int UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Module { get; set; } = "EMR";
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Details { get; set; } = string.Empty;
    public string Status { get; set; } = "SUCCESS";
}
```

### 1.4. `IntegrationSetting`

```csharp
public class IntegrationSetting : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsEncrypted { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

## 2. Application DTO models

### 2.1. Role matrix DTO

```csharp
public sealed record RolePermissionMatrixDto(
    int Id,
    string Code,
    string Name,
    string Description,
    DataScope DataScope,
    Dictionary<string, List<PermissionAction>> Permissions);
```

### 2.2. EMR audit log DTO

```csharp
public sealed record EmrAuditLogDto(
    int Id,
    int PatientId,
    int RecordId,
    int UserId,
    string Action,
    string Module,
    string IpAddress,
    DateTime Timestamp,
    string Details,
    string Status);
```

### 2.3. Integration config DTO

```csharp
public sealed record IntegrationSettingDto(
    int Id,
    string Category,
    string Code,
    string Name,
    string Value,
    string? Description,
    bool IsEncrypted,
    int? UpdatedBy,
    DateTime UpdatedAt);
```

### 2.4. Drug safety DTO

```csharp
public sealed record DrugInteractionCheckRequest(
    int PatientId,
    List<int> MedicineIds,
    string? Note = null);
```

```csharp
public sealed record DrugInteractionAlert(
    int MedicineId,
    string Severity,
    string Message,
    string[] MatchedIngredients,
    bool BlockPrescription);
```

## 3. Mối quan hệ dữ liệu đề xuất

| Entity | Liên kết | Ghi chú |
|---|---|---|
| `VaiTro` | 1-n với `VaiTroQuyen` | Quản lý vai trò hệ thống |
| `Quyen` | 1-n với `VaiTroQuyen` | Mỗi quyền gắn vào module/action |
| `NhanVienVaiTro` | n-1 với `NhanVien`, `VaiTro` | Phân quyền người dùng |
| `PhanQuyenCoSo` | n-1 với `NhanVien`, `CoSo`, `VaiTro` | Phạm vi cơ sở/khoa |
| `EmrAuditLog` | nhiều với `BenhNhan` / `LuotKham` | Ghi nhật ký bệnh án |
| `IntegrationSetting` | standalone | Cấu hình HL7/PACS/BHYT |

## 4. Cập nhật cần bổ sung trong thực tế

- `VaiTro` cần có các fields: `Code`, `DataScope`, `IsActive`
- `Quyen` cần có fields: `Module`, `Action`, `DataScope`
- `EmrAuditLog` nên có `RecordType`, `OldValue`, `NewValue`, `SessionId`
- `IntegrationSetting` nên lưu `EncryptedValue` nếu biện pháp bảo mật yêu cầu

## 5. Chốt thiết kế

- DTO nên tách riêng Request/Response, không expose entity trực tiếp
- Role matrix nên biểu diễn dưới dạng map `module -> list action`
- Audit log nên là immutable append-only log
- Integration config nên dùng `category/code` làm khóa nghiệp vụ
