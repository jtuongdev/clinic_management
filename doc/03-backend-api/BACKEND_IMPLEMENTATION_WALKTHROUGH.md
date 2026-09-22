# BACKEND IMPLEMENTATION WALKTHROUGH

## 1. Mục tiêu

Tài liệu này dùng để tiếp quản mã nguồn Backend của hệ thống ClinicManagement sau khi các tính năng công việc lâm sàng và vận hành đã được triển khai trên API layer. Mục tiêu là giúp các AI agent hoặc developer khác hiểu nhanh:

- kiến trúc phần backend
- contract API đang có
- business rules cốt lõi
- dependency injection / startup registration
- các bước test nhanh và mở rộng tiếp theo

Lưu ý: tài liệu này chỉ tập trung vào Backend, không can thiệp Frontend.

---

## 2. Kiến trúc tổng quan

### 2.1 Công nghệ

- ASP.NET Core Web API trên .NET 8
- Entity Framework Core + SQL Server
- MediatR (queries/commands)
- Clean Architecture / service + repository pattern
- JSON serialization với enum string support
- JWT authentication chuẩn hóa trong `Program.cs`

### 2.2 Cấu trúc project

```text
ClinicManagement/
├── ClinicManagement.API/
│   ├── Controllers/
│   │   ├── LuotKham/
│   │   │   └── LuotKhamController.cs
│   │   ├── AdminSettingsController.cs
│   │   ├── ClinicalSafetyController.cs
│   │   └── BaseController.cs
│   ├── Program.cs
│   └── appsettings.json
├── ClinicManagement.Application/
│   ├── DTOs/
│   │   ├── Admin/
│   │   │   └── RoleMatrixDto.cs
│   │   ├── Medical/
│   │   │   ├── DrugSafetyDto.cs
│   │   │   └── ClinicalValidationDto.cs
│   │   ├── System/
│   │   │   ├── EmrAuditLogDto.cs
│   │   │   └── IntegrationSettingDto.cs
│   │   └── ...
│   ├── Services/
│   │   ├── Interfaces/
│   │   │   └── IClinicalGovernanceService.cs
│   │   └── ClinicalGovernanceService.cs
│   ├── Features/
│   │   ├── LuotKham/
│   │   ├── Billing/
│   │   └── ...
│   └── DependencyInjection.cs
├── ClinicManagement.Domain/
│   ├── Common/Enums/
│   │   ├── DataScope.cs
│   │   ├── PermissionAction.cs
│   │   └── ...
│   ├── Repositories/System/
│   │   ├── IClinicalAccessRepository.cs
│   │   ├── IEmrAuditLogRepository.cs
│   │   └── IIntegrationSettingRepository.cs
│   ├── System/
│   │   ├── EmrAuditLog.cs
│   │   ├── IntegrationSetting.cs
│   │   └── ...
│   └── ...
├── ClinicManagement.Infrastructure/
│   ├── Persistence/
│   │   ├── ClinicDbContext.cs
│   │   └── Repositories/
│   │       └── System/
│   │           ├── ClinicalAccessRepository.cs
│   │           ├── EmrAuditLogRepository.cs
│   │           └── IntegrationSettingRepository.cs
│   └── ...
└── doc/
    ├── BACKEND_IMPLEMENTATION_WALKTHROUGH.md
    └── backend-api-tests.http
```

---

## 3. Cấu trúc Controller & API chính

### 3.1 `LuotKhamController`

File chính: `ClinicManagement.API/Controllers/LuotKham/LuotKhamController.cs`

Endpoints hiện có:

| Method | Endpoint | Mục đích | Trạng thái |
|---|---|---|---|
| GET | `/api/luotkham` | Lấy danh sách lượt khám | Có |
| GET | `/api/luotkham/{id}` | Thông tin lượt khám theo id | Có |
| POST | `/api/luotkham/{id}/validate` | Kiểm tra điều kiện hợp lệ trước khi hoàn tất khám | Có |
| POST | `/api/luotkham/{id}/complete` | Hoàn tất khám + lập hóa đơn nếu có tiền | Có |
| POST | `/api/luotkham/{id}/emr/lock` | Khóa hồ sơ EMR / ký số | Có |
| GET | `/api/luotkham/{id}/summary` | Tóm tắt điều trị | Có |
| GET | `/api/luotkham/thong-ke` | Thống kê lượt khám | Có |
| GET | `/api/luotkham/dang-xu-ly` | Danh sách đang xử lý | Có |
| GET | `/api/luotkham/danh-sach-benh-nhan` | Danh sách bệnh nhân trong lượt khám | Có |
| GET | `/api/luotkham/thong-ke-benh-nhan` | Thống kê bệnh nhân | Có |
| GET | `/api/luotkham/thong-ke-kham-benh` | Thống kê khám bệnh theo cơ sở/khoa | Có |

### 3.2 `AdminSettingsController`

File: `ClinicManagement.API/Controllers/AdminSettingsController.cs`

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/admin/roles` | Lấy ma trận quyền theo module/action |
| POST | `/api/admin/roles` | Cập nhật ma trận quyền |
| GET | `/api/admin/audit-logs` | Query EMR audit logs |
| POST | `/api/admin/audit-logs` | Ghi audit log mới |
| GET | `/api/admin/integration-config` | Lấy cấu hình tích hợp |
| POST | `/api/admin/integration-config` | Upsert cấu hình tích hợp |

### 3.3 `ClinicalSafetyController`

File: `ClinicManagement.API/Controllers/ClinicalSafetyController.cs`

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/api/ai/drug-interaction-check` | Kiểm tra tương tác thuốc và cảnh báo dị ứng |

---

## 4. Contract DTO chính

### 4.1 Drug safety

`ClinicManagement.Application/DTOs/Medical/DrugSafetyDto.cs`

```json
{
  "patientId": 1001,
  "medicineIds": [101, 202, 303],
  "note": "Khám lại sau 3 ngày"
}
```

## 5. Phân quyền thật ở API layer

- Bảng `RolePermissionMatrix` lưu từng dòng `RoleId + Module + Action + DataScope`.
- Migration tạo bảng: `20260916122459_ThemMaTranQuyenVaScope`.
- `ClinicalAuthorizeAttribute` kiểm tra JWT claim `sub` hoặc `userId`, sau đó gọi `ClinicalGovernanceService`.
- Nếu không có claim hợp lệ trả `401`; có claim nhưng không có quyền trả `403`.
- `DataScope` được kiểm tra trong permission row:
  - `ALL_FACILITIES`: cho phép mọi phạm vi.
  - `FACILITY_ONLY`: cho phép cơ sở/chi nhánh được gán.
  - `DEPARTMENT_ONLY`: chỉ cho phép khoa/phòng.
- Dữ liệu quyền mặc định chỉ còn là fallback chuyển đổi khi bảng chưa có dữ liệu. Khi đã có dữ liệu trong bảng, không còn bypass theo tên `Admin`.

Để cấp quyền cho vai trò, gọi `POST /api/admin/roles` với `id` là `VaiTro.Id`. API sẽ thay thế toàn bộ ma trận quyền của vai trò trong một transaction lưu EF Core.

## 6. Audit export và giao dịch lâm sàng

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/admin/audit-logs/export` | Xuất audit trail dạng CSV, hỗ trợ cùng bộ lọc patient/user/action/from/to |
| GET | `/api/clinical/transactions/{visitId}/summary` | Lấy một transaction summary gồm chẩn đoán, chỉ định, đơn thuốc và điều kiện hoàn tất |
| POST | `/api/clinical/transactions/{visitId}/validate` | Kiểm tra điều kiện nghiệp vụ trước khi hoàn tất lượt khám |

Các endpoint này đều đi qua `ClinicalAuthorizeAttribute`, không được coi là endpoint public. File CSV giới hạn tối đa 10.000 dòng cho một lần xuất để tránh tạo response không kiểm soát.

## 7. Migration và triển khai

Chạy tại thư mục gốc repository:

```bash
dotnet ef database update \
  --project ClinicManagement.Infrastructure/ClinicManagement.Infrastructure.csproj \
  --startup-project ClinicManagement.API/ClinicManagement.API.csproj \
  --context ClinicDbContext
```

Migration liên quan:

- `20260916122023_AddGovernanceAuditAndIntegrationSettings`: bảng audit EMR và cấu hình tích hợp.
- `20260916122459_ThemMaTranQuyenVaScope`: bảng ma trận quyền và khóa ngoại tới `VaiTro`.

Các file Billing gốc ở thư mục feature đã được chuẩn hóa thành:

- `CacLenhVienPhi.cs`
- `CacTruyVanVienPhi.cs`
- `AnhXaVienPhi.cs`

Response mẫu:

```json
{
  "isSafe": false,
  "status": "WARNING",
  "alerts": [
    {
      "medicineId": 101,
      "severity": "CRITICAL",
      "message": "Trùng nhóm/hoạt chất nguy cơ tương tác nghiêm trọng với sản phẩm đã kê trước đó",
      "matchedIngredients": ["Aspirin", "Ibuprofen"],
      "blockPrescription": true
    }
  ],
  "summary": "Cần kiểm tra lại trước khi lưu đơn thuốc."
}
```

### 4.2 EMR audit log

`ClinicManagement.Application/DTOs/System/EmrAuditLogDto.cs`

Request:

```json
{
  "patientId": 1001,
  "recordId": 9001,
  "userId": 11,
  "action": "VIEW",
  "module": "EMR",
  "ipAddress": "192.168.1.45",
  "details": "Bác sĩ xem hồ sơ bệnh án",
  "status": "SUCCESS"
}
```

### 4.3 Integration config

`ClinicManagement.Application/DTOs/System/IntegrationSettingDto.cs`

```json
{
  "category": "LIS",
  "code": "HL7_PORT",
  "name": "Cổng HL7",
  "value": "2575",
  "description": "Cổng nghe kết nối máy xét nghiệm",
  "isEncrypted": false
}
```

### 4.4 Role matrix

`ClinicManagement.Application/DTOs/Admin/RoleMatrixDto.cs`

```json
{
  "id": 1,
  "code": "ADMIN",
  "name": "Quản trị viên",
  "description": "Toàn quyền",
  "dataScope": "ALL_FACILITIES",
  "permissions": {
    "patient": ["VIEW", "CREATE", "EDIT", "DELETE", "APPROVE"],
    "examination": ["VIEW", "CREATE", "EDIT", "DELETE", "APPROVE"]
  }
}
```

---

## 5. Business rules cốt lõi

### 5.1 Hàng đợi & triage

- Hệ thống ưu tiên xếp hàng theo thứ tự: `EMERGENCY` -> `URGENT` -> `NORMAL`.
- Dữ liệu sinh hiệu có thể được tổng hợp cho hover widget bao gồm:
  - Mạch
  - Huyết áp
  - SpO2
  - BMI (tự tính từ cân nặng / chiều cao)
- Về mặt API, tính toán trọng tâm phục vụ UI widget không cần trả toàn bộ dữ liệu lớn.

### 5.2 Kiểm tra dị ứng & tương tác thuốc

Logic đang triển khai trong `ClinicalGovernanceService.CheckDrugInteractionAsync`:

1. Nhận `patientId` + `medicineIds`.
2. Loại bỏ giá trị rỗng / duplicate.
3. Nếu không có thuốc -> trả về SAFE.
4. Nếu số thuốc > 3 -> cảnh báo mức WARNING.
5. Nếu phát hiện thuốc 101 + 202 -> trả ALERT CRITICAL với `BlockPrescription = true`.
6. Kết quả được đưa vào `DrugInteractionCheckResponse`.

Đây là logic prototype. Khi triển khai sang production, cần hook vào dữ liệu thuốc thật + tiền sử dị ứng thực tế của bệnh nhân.

### 5.3 Khóa hồ sơ EMR bất biến

Logic đang có trong `ClinicalGovernanceService.LockEmrAsync` và `LuotKhamController.LockEmr`:

- Bắt buộc `reason` không được để trống.
- Nếu không có chữ ký số truyền vào, hệ thống sinh chữ ký theo mẫu:

```text
SIG_{yyyyMMddHHmmss}_{userId}_{recordId}
```

- Ghi log audit và đánh dấu trạng thái khóa hồ sơ.
- `LockEmrResponse` bao gồm:
  - `RecordId`
  - `Signature`
  - `Locked`
  - `Message`

### 5.4 Hoàn tất lượt khám & tạo hóa đơn

Endpoint: `POST /api/luotkham/{id}/complete`

Logic cốt lõi:

- Tìm lượt khám theo id.
- Kiểm tra trạng thái lượt khám.
- Chống tạo trùng hóa đơn nếu đã tồn tại chưa hủy.
- Chuyển trạng thái sang hoàn tất.
- Tạo hóa đơn khi tổng tiền > 0.
- Tạo chi tiết hóa đơn từ dịch vụ / đơn thuốc tương ứng.
- Tạo công nợ bệnh nhân nếu cần.
- Nếu tổng bằng 0 thì vẫn hoàn tất lượt khám nhưng không tạo hóa đơn.

### 5.5 EMR audit log

- `EmrAuditLog` ghi các thao tác: `VIEW`, `SIGN`, `PRESCRIBE`, `BILLING`, `EXPORT`.
- `GetAuditLogsAsync` hỗ trợ lọc theo:
  - bệnh nhân
  - user
  - action
  - từ ngày / đến ngày
  - pageIndex, pageSize
- Đây là việc cần phát triển tiếp theo ở mức persistence thực chiến vì hiện tại service đang chạy dưới mock list / in-memory default dataset.

---

## 6. Dependency Injection & Startup

Trong `ClinicManagement.API/Program.cs`, các registration chính là:

```csharp
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructure(builder.Configuration);
```

Các service liên quan đến governance đã được đăng ký trong Application layer và được controller inject qua interface:

```csharp
private readonly IClinicalGovernanceService _clinicalGovernanceService;
```

Cần lưu ý:

- Authentication/Authorization đã được bật qua `AddAuthentication` + `AddAuthorization`.
- Mặc định API không khóa route bằng `[Authorize]` ở controller hiện tại; điều này cần được hoàn thiện ở giai đoạn production.
- JWT config nằm trong `Program.cs` với `JwtBearer` và validation cùng `Issuer/Audience/SigningKey`.

---

## 7. Hướng dẫn test nhanh cho Agent tiếp theo

### 7.1 Build và chạy API

```bash
dotnet restore

dotnet build ClinicManagement.API/ClinicManagement.API.csproj --no-restore

dotnet run --project ClinicManagement.API/ClinicManagement.API.csproj
```

Nếu backend đang chạy HTTPS local:

```text
https://localhost:7081
```

Swagger/Scalar tương ứng:

```text
https://localhost:7081/scalar/v1
```

### 7.2 File test nhanh

Dùng file mẫu `doc/03-backend-api/backend-api-tests.http` để gửi request nhanh trong VS Code REST Client hoặc REST Client extension.

### 7.3 Cách test chức năng chính

1. GET `/api/luotkham` và verify danh sách
2. POST `/api/ai/drug-interaction-check` với medicineIds hợp lệ
3. POST `/api/admin/integration-config` với LIS / PACS / BHYT payload
4. GET `/api/admin/audit-logs?patientId=1001`
5. POST `/api/luotkham/{id}/complete` với dữ liệu bệnh nhân hợp lệ
6. POST `/api/luotkham/{id}/emr/lock` với `lyDo` không rỗng

---

## 8. Các điểm cần mở rộng tiếp theo

### P0 (khẩn cấp)

- Gắn `EmrAuditLog` và `IntegrationSetting` vào repository EF thật thay vì mock dataset.
- Thêm `Authorize` + policy trên route phù hợp với vai trò vận hành.
- Kiểm tra `LyDo` + `ICD-10` chính xác trước khi hoàn tất lượt khám.
- Bọc transaction cho hoàn tất khám + tạo hóa đơn + công nợ.

### P1 (quan trọng)

- Hook rule dị ứng vào dữ liệu tiền sử bệnh + hoạt chất thuốc thật.
- Thêm data scope check dựa trên cơ sở/khoa/phòng.
- Thêm `AuditLog` cho từng action: `VIEW`, `SIGN`, `PRESCRIBE`, `BILLING`.

### P2 (cải tiến)

- Tích hợp HL7 / MLLP cho LIS.
- Tích hợp PACS viewer URL và AE Title config.
- Thêm notification / alert khi thuốc bị chặn hoặc hồ sơ bị khóa.

---

## 9. Kết luận

Backend hiện tại đã có các nền tảng cốt lõi cần cho hệ thống y tế: 

- lượt khám & hoàn tất khám
- kiểm tra tương tác thuốc
- khóa hồ sơ EMR
- audit log
- cấu hình tích hợp
- role matrix mock/contract

Tuy nhiên, đối với môi trường production / HIS thật, phần quan trọng nhất cần tiếp tục là:

- persistence thực tế cho audit / config / role
- policy phân quyền thật
- transaction và validation nghiệp vụ mạnh hơn
- kiểm tra dữ liệu lâm sàng theo real domain data

Đây là điểm khởi đầu tốt để tiếp tục phát triển mà không làm đứt ngữ cảnh giữa các agent.
