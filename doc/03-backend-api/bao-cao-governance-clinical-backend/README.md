# Báo cáo Backend Governance & Clinical APIs

## Mục tiêu

Tài liệu này mô tả chi tiết các API Backend cần phục vụ giao diện DoctorUI và AdminUI liên quan đến:
- RBAC / ma trận phân quyền theo module và action
- Audit log EMR theo chuẩn TT 46/2018/TT-BYT
- Cấu hình tích hợp LIS/PACS/BHYT
- Kiểm tra tương tác thuốc và khóa hồ sơ EMR sau khi hoàn tất khám

## Phạm vi triển khai

- Backend: ASP.NET Core / .NET 8
- Domain model: `ClinicManagement.Domain`
- Application service: `ClinicManagement.Application.Services`
- API controller: `ClinicManagement.API.Controllers`

## Tổng quan hệ thống

| Hạng mục | Mục đích | Trạng thái | File chính |
|---|---|---:|---|
| RBAC / Data Scope | Quản lý quyền theo module, action, phạm vi dữ liệu | Hoàn thiện skeleton | `ClinicManagement.Application/Services/ClinicalGovernanceService.cs` |
| EMR Audit Log | Ghi log xem, ký, thanh toán, cấp phát, xuất dữ liệu | Hoàn thiện skeleton | `ClinicManagement.Domain/System/EmrAuditLog.cs` |
| Integration Config | Quản lý cấu hình HL7, PACS, BHYT | Hoàn thiện skeleton | `ClinicManagement.Domain/System/IntegrationSetting.cs` |
| Drug Safety | Kiểm tra tương tác thuốc | Hoàn thiện logic mẫu | `ClinicManagement.Application/DTOs/Medical/DrugSafetyDto.cs` |
| EMR Lock | Khóa hồ sơ sau khi hoàn tất và ký số | Hoàn thiện logic mẫu | `ClinicManagement.API/Controllers/LuotKham/LuotKhamController.cs` |

## Cấu trúc thư mục

- [01-api-contract.md](./01-api-contract.md)
- [02-models-and-dtos.md](./02-models-and-dtos.md)
- [03-business-rules.md](./03-business-rules.md)
- [04-implementation-status.md](./04-implementation-status.md)

## File source chính

- `ClinicManagement.Application/Services/Interfaces/IClinicalGovernanceService.cs`
- `ClinicManagement.Application/Services/ClinicalGovernanceService.cs`
- `ClinicManagement.API/Controllers/AdminSettingsController.cs`
- `ClinicManagement.API/Controllers/ClinicalSafetyController.cs`
- `ClinicManagement.API/Controllers/LuotKham/LuotKhamController.cs`

## Mức độ hoàn thiện hiện tại

- P0 (cần thiết): Đã có contract API, entities và service layer cơ sở
- P1 (business validation): Đã có logic mẫu cho khóa EMR, cảnh báo thuốc, quyền, audit log
- P2 (persistence thật / DB): Cần nối repository / EF Core thực tế cho môi trường production

## Khuyến nghị tiếp theo

1. Chuyển `ClinicalGovernanceService` từ mock data sang repository EF Core thật.
2. Tạo migration cho `EmrAuditLog` và `IntegrationSetting`.
3. Thêm middleware kiểm tra `DataScope` và `PermissionAction` trên toàn bộ API.
4. Bổ sung policy `Authorize` theo role/module.
5. Tích hợp kiểm tra dị ứng thuốc với tiền sử bệnh nhân và danh mục thuốc.
