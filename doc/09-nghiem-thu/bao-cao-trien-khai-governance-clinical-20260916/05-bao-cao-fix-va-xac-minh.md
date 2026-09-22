# 5. Báo cáo fix contract Backend–Frontend

## 5.1. Phạm vi đã sửa

| Vấn đề từ tài liệu đối chiếu | Thay đổi thực tế | Trạng thái |
|---|---|---|
| Audit không lọc `module` | Bổ sung `module` từ Controller -> Service -> Repository -> query EF | Đã sửa |
| Role response mất metadata | Join `VaiTro` theo `RoleId`, trả tên vai trò và code chuẩn hóa | Đã sửa |
| Không có API catalog thuốc | Thêm `GET /api/Thuoc/catalog`, tìm theo tên/hoạt chất, trả tồn/BHYT | Đã sửa |
| Response drug safety lệch | DoctorUI dùng object `{ isSafe, status, alerts, summary }` | Đã sửa |
| Drug safety là dữ liệu mẫu | Đọc `Item.HoatChat` và tiền sử `LoaiTienSu.DI_UNG` thật từ EF | Đã sửa |
| GET đơn thuốc không khớp | Thêm `GET /api/luot-kham/{luotKhamId}/don-thuoc` lấy đơn mới nhất | Đã sửa |
| Payload tạo đơn lệch | DoctorUI map sang `itemId`, `soLuongKe`, `donViTinh`, `lieuDung`, `soNgay`, `huongDan` | Đã sửa |
| EMR lock chỉ trả response | Thêm `EmrLocked`, `EmrSignature`, `EmrLockedAt`, `EmrLockedBy`, lưu database | Đã sửa |
| Sau khóa vẫn có thể sửa nghiệp vụ | Chặn complete, chẩn đoán, sinh hiệu, chỉ định và các thao tác đơn thuốc | Đã sửa |
| Clinical transaction chưa có UI gọi | DoctorUI validate trước complete, thêm API summary/validate | Đã sửa |
| UI giả thành công khi API lỗi | Bỏ fallback báo thành công ở flow complete/lock; hiển thị lỗi thật | Đã sửa |

## 5.2. File Backend chính

- `ClinicManagement.API/Controllers/AdminSettingsController.cs`
- `ClinicManagement.API/Controllers/ClinicalTransactionsController.cs`
- `ClinicManagement.API/Controllers/PrescriptionController.cs`
- `ClinicManagement.API/Controllers/ThuocController.cs`
- `ClinicManagement.API/Authorization/ClinicalAuthorizeAttribute.cs`
- `ClinicManagement.Application/Services/ClinicalGovernanceService.cs`
- `ClinicManagement.Domain/Examination/LuotKham/LuotKham.cs`
- `ClinicManagement.Domain/Inventory/Item.cs`
- `ClinicManagement.Domain/System/RolePermissionMatrix.cs`
- `ClinicManagement.Domain/Repositories/System/IClinicalDrugSafetyRepository.cs`
- `ClinicManagement.Infrastructure/Persistence/Repositories/System/ClinicalDrugSafetyRepository.cs`
- `ClinicManagement.Infrastructure/Persistence/Repositories/System/EmrAuditLogRepository.cs`

## 5.3. File Frontend chính

- `ClinicManagement.DoctorUI/src/examination/api/examination.api.ts`
- `ClinicManagement.DoctorUI/src/examination/types/examination/exam.types.ts`
- `ClinicManagement.DoctorUI/src/examination/components/workspaces/TreatmentWorkspace.tsx`
- `ClinicManagement.DoctorUI/src/examination/components/workspaces/ElectronicRecordWorkspace.tsx`
- `ClinicManagement.AdminUI/src/settings/api/settings.api.ts`
- `ClinicManagement.AdminUI/src/settings/pages/RoleManagementPage.jsx`
- `ClinicManagement.AdminUI/src/settings/pages/AuditLogPage.jsx`
- `ClinicManagement.AdminUI/src/settings/pages/IntegrationConfigPage.jsx`

## 5.4. Migration mới

```text
20260916122023_AddGovernanceAuditAndIntegrationSettings
20260916122459_ThemMaTranQuyenVaScope
20260916123817_DongBoClinicalContracts
```

Migration cuối được tạo bằng `dotnet ef migrations add DongBoClinicalContracts`.

Migration này bổ sung:

- cột khóa EMR trong `LuotKham`;
- trường hoạt chất, số đăng ký, đường dùng, mã BHYT, tỷ lệ BHYT trong `Item`.

Trạng thái áp dụng trên database:

```text
20260916122023_AddGovernanceAuditAndIntegrationSettings  Applied
20260916122459_ThemMaTranQuyenVaScope                    Applied
20260916123817_DongBoClinicalContracts                   Applied
```

Đã kiểm tra lại bằng `dotnet ef migrations list`; không còn migration pending.

## 5.5. Build đã thực hiện

### Backend

```bash
dotnet build ClinicManagement.slnx --nologo
```

Kết quả sau lần sửa cú pháp: **Build succeeded, 0 error**. Các warning còn lại là warning nullable/hiding đã tồn tại ở module khác.

### AdminUI

```bash
npm run build
```

Đã sửa lỗi build do JSX import các TypeScript interface như runtime value. Các page giờ chỉ import `settingsApi`.

### DoctorUI

Đã cài dependency còn thiếu, sửa các lỗi TypeScript về nullable vitals, payload kê đơn và response cảnh báo dị ứng, sau đó chạy lại thành công:

```text
vite build: built successfully
TypeScript: 0 error
```

## 5.6. Cách test end-to-end sau khi cài dependency

1. Chạy SQL Server. Database đã được cập nhật đủ migration ở trên.
2. Nếu triển khai sang database/môi trường khác, áp dụng migration:

```bash
dotnet ef database update \
  --project ClinicManagement.Infrastructure/ClinicManagement.Infrastructure.csproj \
  --startup-project ClinicManagement.API/ClinicManagement.API.csproj \
  --context ClinicDbContext
```

3. Seed/cập nhật quyền cho role đang gán với user test.
4. Đăng nhập lấy JWT có claim `sub` hoặc `userId`.
5. Kiểm tra:

```http
GET /api/admin/audit-logs?module=EMR&action=VIEW
GET /api/admin/audit-logs/export?module=EMR
GET /api/Thuoc/catalog?keyword=paracetamol
GET /api/luot-kham/100/don-thuoc
POST /api/clinical/transactions/100/validate
POST /api/LuotKham/100/complete
POST /api/luot-kham/100/emr/lock
```

6. Sau khi khóa EMR, thử sửa chẩn đoán/đơn thuốc và xác nhận API trả `409`.

## 5.7. Kết luận

Các contract lệch đã được sửa ở source code và tài liệu tích hợp đã được hạ mức kết luận từ “100% PASS” xuống “đã đồng bộ source contract”. Migration đã được áp dụng thành công trên database cấu hình hiện tại. Vẫn cần chạy test API end-to-end với JWT, dữ liệu quyền và dữ liệu nghiệp vụ thật trước khi kết luận production-ready.
