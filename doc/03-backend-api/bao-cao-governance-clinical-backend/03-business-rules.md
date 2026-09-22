# 03. Business Rules & Logic Implementation

## 1. RBAC / Data Scope

### Quy tắc nghiệp vụ

- Mỗi vai trò có ma trận quyền theo module × action.
- Các action hỗ trợ: `VIEW`, `CREATE`, `EDIT`, `DELETE`, `APPROVE`.
- `DataScope` quy định phạm vi dữ liệu:
  - `ALL_FACILITIES`: toàn bộ cơ sở
  - `FACILITY_ONLY`: chỉ cơ sở đang làm việc
  - `DEPARTMENT_ONLY`: chỉ khoa/phòng được phân công
  - `BRANCH`: chi nhánh phụ trách

### Logic hiện tại

- `IClinicalGovernanceService.HasPermissionAsync()` đã có template kiểm tra quyền.
- `RolePermissionMatrixDto` lưu dạng dictionary `module -> List<PermissionAction>`.
- Service mock hiện đang trả role mặc định để frontend có thể test nhanh.

### Cần bổ sung khi production

- Dùng `NhanVienVaiTro` + `PhanQuyenCoSo` để resolve quyền theo nhân viên.
- Thêm middleware kiểm tra `DataScope` và `Module/Action` ở từng route.
- Không để quyền được hardcode ở frontend.

## 2. EMR Audit Trail

### Yêu cầu nghiệp vụ

- Ghi mọi thao tác: xem, chỉnh sửa, ký số, thanh toán, cấp phát, xuất dữ liệu.
- Bảo toàn log không bị xóa, chỉ append.
- Có thể filter theo thời gian / user / action / patient.

### Logic hiện tại

- `EmrAuditLog` model có đầy đủ fields:
  - `PatientId`
  - `RecordId`
  - `UserId`
  - `Action`
  - `Module`
  - `IpAddress`
  - `Timestamp`
  - `Details`
  - `Status`
- `AdminSettingsController.GetAuditLogsAsync()` hỗ trợ filter cơ bản.

### Nên bổ sung

- `OldValue` / `NewValue` cho truy vết thay đổi dữ liệu chi tiết.
- `EntityType`, `EntityId`, `TraceId` cho tracing nhanh.
- Chế độ read-only log, không cho xóa sửa (nếu theo compliance).

## 3. Integration Config

### Các kênh tích hợp cần xử lý

- `LIS`: HL7 / MLLP / port / UTF-8
- `PACS`: AE Title / Host / Port 104 / viewer URL
- `BHYT`: mã cơ sở, định dạng 4210/130

### Logic hiện tại

- `IntegrationSetting` model, `UpsertIntegrationSettingRequest`, controller `GET/POST /api/admin/integration-config` đã có skeleton đầy đủ.
- Chưa có validation đối với format vận hành và encryption/secret storage.

### Nhu cầu production

- Lưu secret ở Key Vault / Azure Key Vault hoặc config encryption.
- Validate host/port/format trước khi lưu.
- Có phân quyền: chỉ Admin mới edit config.

## 4. Drug Safety / Allergy Check

### Quy tắc nghiệp vụ

- Kiểm tra thuốc được kê trong cùng đơn và đối chiếu với tiền sử dị ứng bệnh nhân.
- Nếu trùng nhóm thuốc/hoạt chất -> cảnh báo mức độ `SAFE`, `WARNING`, `CRITICAL`.
- `CRITICAL` hoặc `BlockPrescription = true` phải chặn lưu đơn.

### Logic hiện tại

- `CheckDrugInteractionAsync()` đã có logic mẫu.
- Khi nhiều thuốc > 3 hoặc trùng cặp cụ thể thì trả về alert.
- Có thể dừng lưu đơn nếu `BlockPrescription == true`.

### Nhu cầu nâng cấp

- Gắn với `TienSuBenh` / `BenhNhan` / `Thuốc` real data.
- Tích hợp hoạt chất, nhóm thuốc, cảnh báo dị ứng theo tiền sử bệnh nhân.
- Kết hợp với AI suggestion hoặc risk engine.

## 5. EMR Lock / Digital Signature

### Quy tắc nghiệp vụ

- Bắt buộc phải có lý do khám và ít nhất 1 chẩn đoán chính trước khi hoàn tất.
- Tạo chữ ký số dạng: `SIG_{Timestamp}_{DoctorId}_{Hash}`.
- Sau khi lock, hồ sơ chuyển sang read-only, không cho sửa/xoá.

### Logic hiện tại

- `LockEmrAsync()` có logic mẫu xác thực `LyDo` và sinh chữ ký.
- `LuotKhamController` đã expose endpoint `POST /api/luot-kham/{id}/emr/lock`.

### Nhu cầu production

- Kiểm tra `Trạng thái lượt khám` và `Chẩn đoán` trước khi lock.
- Viết log lock vào `EmrAuditLog` và lưu hash/metadata ký số.
- Chặn update record nếu trạng thái là `LOCKED`.

## 6. Trạng thái kết luận

| Hạng mục | Mức hiện tại | Nhận xét |
|---|---|---|
| Role matrix | Skeleton hoàn chỉnh | Cần repo EF Core và middleware |
| Audit Log | Skeleton hoàn chỉnh | Cần append-only + compliance |
| Integration Config | Skeleton hoàn chỉnh | Cần secret management |
| Drug Safety | Logic mẫu | Cần tích hợp dữ liệu thật |
| EMR Lock | Logic mẫu | Cần kiểm tra điều kiện nghiệp vụ thật |

## 7. Kiến nghị ưu tiên

1. Thực hiện repo cho `EmrAuditLog` + `IntegrationSetting`
2. Hoàn thiện kiểm tra ít nhất 1 chẩn đoán chính trong `CompleteExam`
3. Tích hợp rule nội bộ với `TienSuBenh` và `Item`
4. Bổ sung `Authorize` + `PermissionScope` middleware
5. Bảo mật cho config integration bằng secret store
