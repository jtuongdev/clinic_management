# 2. API và flow nghiệp vụ

## 2.1. Cập nhật ma trận quyền

```http
POST /api/admin/roles
Content-Type: application/json
```

Request:

```json
{
  "id": 2,
  "code": "DOCTOR",
  "name": "Bac si",
  "description": "Quyen nghiep vu kham benh",
  "dataScope": "DEPARTMENT_ONLY",
  "permissions": {
    "examination": ["VIEW", "CREATE", "EDIT", "APPROVE"],
    "audit": ["VIEW"]
  }
}
```

Flow: nhận `RoleId` -> chuẩn hóa module/action -> xóa quyền cũ -> ghi quyền mới -> `SaveChangesAsync`.

## 2.2. Kiểm tra quyền khi gọi API

```text
Request
  -> ClinicalAuthorizeAttribute
  -> đọc userId từ JWT
  -> lấy role đang hoạt động
  -> lấy RolePermissionMatrix
  -> kiểm tra Module + Action + DataScope
  -> cho phép hoặc trả 401/403
```

## 2.3. Tóm tắt transaction lâm sàng

```http
GET /api/clinical/transactions/{visitId}/summary
```

API tải lượt khám cùng bệnh nhân, chẩn đoán, chỉ định và đơn thuốc; sau đó dùng chung validation trước hoàn tất. API chỉ đọc dữ liệu.

## 2.4. Validation transaction lâm sàng

```http
POST /api/clinical/transactions/{visitId}/validate
```

Kiểm tra:

- Có lý do khám.
- Lượt khám đang ở trạng thái `DANG_KHAM`.
- Có ít nhất một chẩn đoán hoặc ICD hợp lệ.

Hoàn tất thật và lập hóa đơn tiếp tục đi qua:

```http
POST /api/LuotKham/{id}/complete
```

## 2.5. Export audit trail

```http
GET /api/admin/audit-logs/export?patientId=1001&action=VIEW
```

Flow: kiểm tra quyền audit -> truy vấn repository -> lọc -> giới hạn 10.000 dòng -> sinh CSV.

## 2.6. Đối chiếu tài liệu

| Nội dung tài liệu | Phần code |
|---|---|
| Role/RBAC và DataScope | `RolePermissionMatrix`, `ClinicalAuthorizeAttribute` |
| Audit trail EMR | `EmrAuditLogRepository`, audit API và export |
| Flow khám và EMR | `ClinicalTransactionsController`, validation service |
| Hoàn tất khám và Billing | `CompleteExamCommandHandler`, `/api/LuotKham/{id}/complete` |
| Cấu hình liên thông | `IntegrationSettingRepository`, `AdminSettingsController` |
| Billing tách file | `CacLenhVienPhi`, `CacTruyVanVienPhi`, `AnhXaVienPhi` |
