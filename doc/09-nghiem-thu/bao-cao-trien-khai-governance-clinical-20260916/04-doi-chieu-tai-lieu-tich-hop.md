# 4. Đối chiếu thực tế với tài liệu tích hợp Backend–Frontend

## 4.1. Kết luận ngắn

Tài liệu tham chiếu:

`doc/02-gap-analysis/10-bao-cao-tich-hop-backend-frontend.md`

**Kết luận: chưa đúng hoàn toàn.** Tài liệu mô tả mục tiêu tích hợp và một số phần đã có code, nhưng đang đánh giá hệ thống là **“100%”** và các test case là **“PASS”** trong khi source hiện tại còn contract lệch hoặc chưa có kiểm chứng end-to-end.

Mức đánh giá thận trọng:

| Nhóm | Đánh giá |
|---|---:|
| Admin API settings/config có route backend tương ứng | 80% |
| Ma trận quyền và scope | 70% |
| Audit query/export | 60% |
| Doctor flow khám bệnh | 80% |
| Kê đơn thuốc | 60% |
| Drug safety | 40% |
| EMR complete/lock | 60% |
| Tích hợp thật hai chiều và kiểm thử end-to-end | Chưa đủ bằng chứng |

## 4.2. Các phần khớp tài liệu

| Nội dung tài liệu | Source kiểm tra | Kết luận |
|---|---|---|
| `GET/POST /api/admin/roles` | `AdminSettingsController`, `settings.api.ts`, `RoleManagementPage.jsx` | Có route và UI gọi API |
| `GET/POST /api/admin/integration-config` | `AdminSettingsController`, `settings.api.ts`, `IntegrationConfigPage.jsx` | Có route và UI gọi API |
| `GET /api/admin/audit-logs/export` | `AdminSettingsController`, `settings.api.ts`, `AuditLogPage.jsx` | Có route, frontend tải blob |
| `POST /api/LuotKham/{id}/start-exam` | `LuotKhamController.StartExam.cs`, `examination.api.ts` | Khớp route |
| `POST /api/LuotKham/{id}/examination` | `MedicalRecord.LuotKhamController.cs`, `examination.api.ts` | Khớp route |
| `POST /api/luot-kham/{id}/don-thuoc` | `PrescriptionController.cs`, `examination.api.ts` | Có route tạo đơn |
| `POST /api/LuotKham/{id}/complete` | `LuotKhamController.cs`, `examination.api.ts` | Có validation và flow tạo hóa đơn |
| `POST /api/luot-kham/{id}/emr/lock` | `LuotKhamController.cs`, `examination.api.ts` | Có route nhận request khóa |

## 4.3. Các phần chưa đúng hoặc chưa đủ

### A. Audit log: UI gửi `module` nhưng backend không lọc `module`

Frontend gửi:

```ts
{
  action,
  module,
  from,
  to
}
```

Nhưng backend `AdminSettingsController.GetAuditLogs` chỉ nhận:

```text
patientId, userId, action, from, to, pageIndex, pageSize
```

`module` không được nhận và không được truyền vào `IEmrAuditLogRepository`.

**Ảnh hưởng:** chọn bộ lọc `EMR`, `BILLING`, `INVENTORY` trên `AuditLogPage.jsx` không lọc đúng phía server. UI chỉ lọc lại dữ liệu trang hiện tại.

Ngoài ra, DTO backend chỉ trả:

```text
id, patientId, recordId, userId, action, module, ipAddress, timestamp, details, status
```

Trong khi TypeScript DTO còn khai báo `userName`, `userRole`, `patientCode`, `patientName`, `actionName`. Các trường này không được backend trả về.

### B. Role matrix: có route nhưng response database chưa giữ metadata vai trò

`GET /api/admin/roles` có route thật. Tuy nhiên khi đọc từ `RolePermissionMatrix`, service dựng response bằng giá trị tổng hợp như:

```text
ROLE_{RoleId}
Vai tro {RoleId}
```

Service chưa join `VaiTro` để trả đúng:

```text
Code, Name, Description
```

Frontend có fallback khi API lỗi, nên UI có thể vẫn hiển thị, nhưng điều đó không đồng nghĩa dữ liệu backend/frontend đã đồng bộ đầy đủ.

Ngoài ra, UI quản lý 7 module, còn backend fallback hiện chưa có đầy đủ `employee`; module `audit` lại được thêm ở backend nhưng chưa có trong ma trận hiển thị của `RoleManagementPage.jsx`.

### C. Drug catalog: frontend có gọi nhưng chưa tìm thấy endpoint backend tương ứng

Frontend gọi:

```http
GET /api/Thuoc/catalog?keyword=...
```

Trong source API hiện tại chưa tìm thấy action route `catalog` tương ứng. Vì vậy endpoint này cần được xem là **chưa xác nhận hoạt động**, có nguy cơ trả `404`.

### D. Drug interaction: response type frontend không khớp backend

Backend trả `DrugInteractionCheckResponse`:

```json
{
  "isSafe": false,
  "status": "WARNING",
  "alerts": [],
  "summary": "..."
}
```

Nhưng `examination.api.ts` khai báo response là `DrugInteractionAlert[]`, tức frontend đang kỳ vọng mảng trực tiếp thay vì object có thuộc tính `alerts`.

**Ảnh hưởng:** code UI cần đọc `response.data.alerts`; nếu đọc trực tiếp như mảng sẽ sai contract runtime.

Ngoài ra, logic hiện tại trong `ClinicalGovernanceService` vẫn là logic mẫu theo ID thuốc `101` và `202`, chưa đối chiếu thật với tiền sử dị ứng của bệnh nhân và hoạt chất trong danh mục thuốc như mô tả tài liệu.

### E. Kê đơn: API tạo đơn có nhưng chưa chứng minh đầy đủ flow UI

Route tạo đơn khớp. Tuy nhiên:

- `GET /api/luot-kham/{id}/don-thuoc` mà frontend khai báo không có action tương ứng độc lập; backend hiện có `GET /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}`.
- API tạo đơn hiện chưa gọi trực tiếp logic kiểm tra dị ứng trước khi lưu.
- UI có fallback local khi API lỗi, do đó thông báo thành công trên giao diện chưa đủ chứng minh database đã lưu.

### F. EMR lock: route có nhưng logic khóa bất biến chưa hoàn chỉnh

Route `POST /api/luot-kham/{id}/emr/lock` có tồn tại. Tuy nhiên service `LockEmrAsync` hiện tạo response chữ ký và trạng thái khóa, chưa thấy cập nhật trạng thái khóa bất biến vào entity/database hoặc cơ chế chặn toàn bộ update/delete trên EMR.

Vì vậy tài liệu không nên kết luận đã “đóng băng toàn bộ hồ sơ EMR sang Read-only bất biến” nếu chưa có persistence và enforcement tương ứng.

### G. Clinical transaction API mới chưa được UI tích hợp

Đã có backend:

```http
GET /api/clinical/transactions/{visitId}/summary
POST /api/clinical/transactions/{visitId}/validate
```

Nhưng tài liệu tích hợp `10-bao-cao-tich-hop-backend-frontend.md` không liệt kê các endpoint này trong API client của DoctorUI/AdminUI.

**Kết luận:** đây là API backend bổ sung, chưa phải integration end-to-end với màn hình UI.

### H. Các test case trong tài liệu chưa đủ bằng chứng

Các nhãn `PASS` trong tài liệu chưa có kèm:

- request/response thực tế;
- database record trước/sau;
- log chạy API;
- test automation hoặc file `.http` đã chạy;
- xác nhận SQL Server và migration đã áp dụng.

Đặc biệt các test `TC-02`, `TC-04`, `TC-05` hiện còn chịu ảnh hưởng bởi các contract lệch nêu trên.

## 4.4. Bảng trạng thái chính xác hơn

| Hạng mục | Trạng thái đúng |
|---|---|
| Admin settings/config route | Đã có route, UI đã gọi, cần test bằng database thật |
| Role matrix persistence | Đã có bảng/repository/migration, response metadata role còn thiếu |
| Scope authorization | Đã có filter API, resource-level scope chưa đầy đủ |
| Audit list | Có query, thiếu filter `module` và thiếu thông tin user/patient display |
| Audit export | Có route và UI tải blob, chưa kiểm chứng end-to-end |
| Queue/start exam | Route và UI khớp |
| Examination save/detail | Route và UI khớp |
| Drug catalog | UI có gọi nhưng backend route chưa được xác nhận |
| Drug interaction | Route có, response type frontend lệch, business logic còn mẫu |
| Create prescription | Route có, GET prescription contract lệch và safety check chưa gắn chặt |
| Complete exam/Billing | Có flow backend và UI gọi |
| EMR lock | Có endpoint, persistence/read-only enforcement chưa hoàn chỉnh |
| Clinical transaction summary/validate | Backend có, UI chưa gọi |

## 4.5. Kết luận cần cập nhật trong tài liệu gốc

Không nên giữ câu:

> “Toàn bộ hệ thống hiện đã đạt sự gắn kết liền mạch 100% giữa Frontend UI và Backend Services.”

Nên thay bằng:

> “Các route chính của AdminUI và DoctorUI đã được nối với backend ở mức contract cơ bản. Một số contract còn lệch ở audit filter, drug catalog, drug interaction response, GET prescription và EMR lock persistence; cần hoàn thiện và kiểm thử database end-to-end trước khi xác nhận tích hợp 100%.”

## 4.6. Thứ tự việc cần sửa

1. Sửa contract `DrugInteractionCheckResponse` ở DoctorUI.
2. Bổ sung hoặc đổi route drug catalog cho khớp frontend.
3. Bổ sung lọc `module` cho audit API/repository.
4. Join thông tin vai trò và chuẩn hóa response role matrix.
5. Bổ sung GET prescription theo `luotKhamId` hoặc sửa frontend gọi đúng `donThuocId`.
6. Persist trạng thái EMR lock và chặn sửa/xóa sau khóa.
7. Tích hợp hai endpoint clinical transaction vào UI nếu muốn gọi là end-to-end.
8. Chạy lại từng test case với request/response và dữ liệu database thật.
