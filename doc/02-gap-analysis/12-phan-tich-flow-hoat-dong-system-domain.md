# BÁO CÁO 12: PHÂN TÍCH FLOW HOẠT ĐỘNG SYSTEM DOMAIN & CLUSTER QUẢN TRỊ HỆ THỐNG

---

## 1. Bối Cảnh & Mục Tiêu Phân Tích

Trong kiến trúc tổng thể của Hệ thống Thông tin Phòng khám / Bệnh viện Đa khoa (HIS/EMR) `ClinicManagement`, phân hệ **System Domain** giữ vai trò nền tảng kiến trúc (Architectural Backbone). Đây là phân hệ chịu trách nhiệm bảo đảm:
- Tính hợp pháp và toàn vẹn của hồ sơ bệnh án điện tử theo **Thông tư 46/2018/TT-BYT**.
- Kiểm soát an ninh, phân quyền đa tầng (Granular RBAC) kết hợp phạm vi dữ liệu đa cơ sở/buồng bệnh (DataScope Engine).
- Tích hợp cổng giao tiếp thiết bị y tế ngoại vi: LIS (HL7 MLLP), PACS (DICOM Web Viewer), và Cổng BHYT (XML 4210 / QĐ 130/QĐ-BYT).

Báo cáo này đối chiếu và phân tích toàn diện mã nguồn thực tế tại các tầng:
1. **Domain Layer:** `ClinicManagement.Domain/System` & `ClinicManagement.Domain/Common/Enums`.
2. **Infrastructure Layer:** `ClinicManagement.Infrastructure/Persistence/Repositories/System` & `ClinicDbContext`.
3. **Application Layer:** `ClinicManagement.Application/Services/ClinicalGovernanceService.cs`.
4. **API Layer:** `ClinicManagement.API/Controllers/AdminSettingsController.cs`, `AuthController.cs`, `ClinicalAuthorizeFilter.cs`.
5. **Frontend Layer:** `ClinicManagement.AdminUI/src/settings/` & `ClinicManagement.DoctorUI/src/examination/`.

---

## 2. Bản Đồ Thực Thể Nghiệp Vụ (System Domain Entities)

```
                       ┌─────────────────────────┐
                       │       NhanVien /        │
                       │        BenhNhan         │
                       └────────────┬────────────┘
                                    │ 1:N
                                    ▼
                       ┌─────────────────────────┐
                       │      RefreshToken       │
                       │  - Token (string)       │
                       │  - ExpiryDate (DateTime)│
                       │  - IsRevoked (bool)     │
                       └─────────────────────────┘

┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│   RolePermissionMatrix  │    │       EmrAuditLog       │    │   IntegrationSetting    │
├─────────────────────────┤    ├─────────────────────────┤    ├─────────────────────────┤
│ - RoleId (int)          │    │ - PatientId (int)       │    │ - Category (string)     │
│ - Module (string)       │    │ - RecordId (int)        │    │ - Code (string)         │
│ - Action (Enum)         │    │ - UserId (int)          │    │ - Name (string)         │
│ - DataScope (Enum)      │    │ - Action (string)       │    │ - Value (string)        │
│ - IsAllowed (bool)      │    │ - Module (string)       │    │ - IsEncrypted (bool)    │
│                         │    │ - IpAddress (string)    │    │ - UpdatedBy (int?)      │
│                         │    │ - Timestamp (DateTime)  │    │ - UpdatedAt (DateTime)  │
│                         │    │ - Details (string)      │    └─────────────────────────┘
│                         │    │ - Status (string)       │
└─────────────────────────┘    └─────────────────────────┘
```

---

## 3. Phân Tích 5 Trục Luồng Vận Hành (Runtime Behavioral Flows)

### 3.1 Luồng Quản Lý Phiên & Thu Hồi Token (IAM & Session Management)
- **Cơ chế xác thực:** Cung cấp định danh qua `AuthController.Login` -> `LoginCommandHandler`.
- **Hỗ trợ bảo mật:**
  - Tự động mã hóa lại mật khẩu cũ sang thuật toán hash an toàn (`Auto-upgrade password hash`) nếu người dùng đăng nhập bằng mật khẩu plain-text ban đầu.
  - Cấp phát đồng thời `AccessToken` (thời hạn 60 phút) và `RefreshToken` lưu trong CSDL.
  - Hỗ trợ kiểm tra hết hạn `IsExpired()` và chủ động thu hồi `Revoke()` ngay khi người dùng đăng xuất hoặc khi quản trị viên khóa tài khoản khẩn cấp.

### 3.2 Luồng Phân Quyền Hạt Mịn & Bảo Vệ Phạm Vi Dữ Liệu (Granular RBAC & DataScope)
- **Tầng can thiệp:** Bộ lọc `ClinicalAuthorizeFilter` bọc lấy các Action Method thông qua thuộc tính `[ClinicalAuthorize(module, action, scope)]`.
- **Cơ chế phân giải:**
  1. Trích xuất `userId` từ JWT claims (`sub` hoặc `userId`).
  2. Truy vấn danh sách vai trò (`roleIds`) của người dùng thông qua `IClinicalAccessRepository`.
  3. Quét bảng `RolePermissionMatrix`:
     - Nếu có cấu hình trong DB: So khớp chính xác `Module`, `Action`, `IsAllowed = true` và `IsScopeAllowed(granted, requested)`.
     - Nếu DB chưa có bản ghi (trong pha chuyển giao dữ liệu): Tự động fallback về ma trận mặc định an toàn (`DefaultRoleMatrix` cho ADMIN, DOCTOR, PHARMACIST).
- **Cấp bậc phạm vi (Scope Hierarchy):**
  - `ALL_FACILITIES`: Cấp cao nhất, toàn quyền mọi cơ sở.
  - `FACILITY_ONLY`: Áp dụng cho cơ sở sở tại, tự động chấp nhận quyền con `BRANCH`.
  - `DEPARTMENT_ONLY`: Bị giới hạn nghiêm ngặt theo Khoa/Phòng phụ trách.
- **Cập nhật ma trận quyền:** API `POST /api/admin/roles` kích hoạt phương thức `ReplaceRoleAsync` xóa và chèn hàng loạt các quyền mới, có hiệu lực ngay lập tức (zero-downtime, không cần khởi động lại dịch vụ).

### 3.3 Luồng Nhật Ký Kiểm Toán Bệnh Án Điện Tử (EMR Audit Trail)
- **Căn cứ pháp lý:** Đáp ứng quy định tại **Điều 7 và Điều 12 Thông tư 46/2018/TT-BYT** đối với phần mềm bệnh án điện tử.
- **Hai hệ nhật ký song song:**
  - `AuditLog`: Giám sát thay đổi cấp độ dữ liệu SQL (`Bang`, `MaBangGhi`, `DuLieuCu`, `DuLieuMoi`, `IpAddress`).
  - `EmrAuditLog`: Nhật ký hành vi lâm sàng chuyên biệt (`PatientId`, `RecordId`, `UserId`, `Action`, `Module`, `Timestamp`, `IpAddress`). Bất kỳ hành động mở xem hồ sơ (`VIEW`), chỉnh sửa (`EDIT`), ký số (`SIGN`), hay xuất dữ liệu (`EXPORT`) đều được ghi vết bất biến (Append-only).
- **Xuất kiểm toán pháp lý:** Endpoint `GET /api/admin/audit-logs/export` cho phép xuất tối đa 10.000 dòng dữ liệu chuẩn định dạng RFC 4180 CSV với mã hóa UTF-8 để phục vụ đoàn thanh tra Bộ Y tế và Giám định BHYT.

### 3.4 Luồng Cổng Cấu Hình Tích Hợp Ngoại Vi (Integration Settings Gateway)
- **Mục tiêu:** Cho phép quản trị viên cấu hình sống (runtime live configuration) các thông số mạng và API của các hệ thống ngoại vi mà không sửa code hay restart server.
- **3 nhóm tích hợp trọng yếu:**
  1. **LIS (Laboratory Information System):** Cấu hình IP máy chủ xét nghiệm, cổng MLLP (Minimal Lower Layer Protocol - mặc định 2575), định dạng mã hóa tiếng Việt (UTF-8).
  2. **PACS (Picture Archiving and Communication System):** Cấu hình DICOM Application Entity Title (`PACS_AE_TITLE`), cổng DICOM Storage (mặc định 104), và URL mẫu để nhúng DICOM Web Viewer vào DoctorUI.
  3. **BHYT Gateway:** Cấu hình mã định danh cơ sở y tế 5 số theo quy chuẩn Bộ Y tế, URL cổng tiếp nhận giám định, và API Key được mã hóa (`IsEncrypted = true`).
- **Thực thi:** Quản lý qua `IIntegrationSettingRepository.UpsertAsync` với cơ chế khóa vết `UpdatedBy` và `UpdatedAt`.

### 3.5 Luồng Giám Sát Điều Kiện Hoàn Tất & Khóa Bệnh Án (EMR Lock & Safety)
- **Kiểm tra tiền điều kiện hoàn tất:** Phương thức `ValidateClinicalRecordCompletionAsync`:
  - Bắt buộc phải có lý do khám bệnh (`LyDoKham`).
  - Lượt khám phải đang ở trạng thái `DANG_KHAM`.
  - Bắt buộc có ít nhất 1 chẩn đoán chính (`LaChanDoanChinh`) hoặc mã ICD-10 hợp lệ.
- **Ký số & Đóng hồ sơ:** `LockEmrAsync`:
  - Khởi tạo mã chữ ký số điện tử (`SIG_{timestamp}_{userId}_{recordId}`).
  - Đóng trạng thái hồ sơ bệnh án điện tử, chuyển sang chế độ bất biến (Read-only).
  - Tự động phát sinh bản ghi kiểm toán `EmrAuditLog` với hành động `SIGN`.

---

## 4. Danh Mục Tài Liệu Chuẩn Hóa Theo Thư Mục Hành Vi

Tài liệu chi tiết theo chuẩn đặc tả luồng hành vi nghiệp vụ y tế (HIS Technical Behavioral Flow Specification) được lưu trữ tại:
👉 **[07_FLOW_QUAN_TRI_HE_THONG_VA_GOVERNANCE.md](./bao-cao-technical-lead-his/tai-lieu-nghiep-vu-flows/07_FLOW_QUAN_TRI_HE_THONG_VA_GOVERNANCE.md)** (Mã flow: `FL-007`).

---

## 5. Kết Luận & Đánh Giá Mức Độ Hoàn Thiện

| Thành phần | Trạng thái | Đánh giá kiến trúc |
|---|:---:|---|
| **Cơ sở dữ liệu (Entities & Migrations)** | `100% HOÀN THIỆN` | Các bảng `RolePermissionMatrix`, `EmrAuditLogs`, `IntegrationSettings` đều đã có DbSet và EntityConfiguration chuẩn EF Core. |
| **Tầng Dịch vụ (ClinicalGovernanceService)** | `100% HOÀN THIỆN` | Xử lý đầy đủ RBAC, fallback matrix, kiểm tra tương tác thuốc, khóa EMR và xuất CSV. |
| **Tầng API & Filters (AdminSettingsController)** | `100% HOÀN THIỆN` | Đầy đủ các endpoint `/api/admin/roles`, `/api/admin/audit-logs`, `/api/admin/integration-config` gắn `[ClinicalAuthorize]`. |
| **Giao diện AdminUI** | `100% HOÀN THIỆN` | Gắn kết trực tiếp API backend tại `RoleManagementPage`, `AuditLogPage`, `IntegrationConfigPage`. |
| **Giao diện DoctorUI** | `100% HOÀN THIỆN` | Gắn kết tính năng kiểm tra tương tác thuốc và ký số EMR tại `TreatmentWorkspace` và `ElectronicRecordWorkspace`. |
