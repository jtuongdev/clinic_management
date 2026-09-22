# BÁO CÁO KẾT QUẢ TÍCH HỢP BACKEND VÀO GIAO DIỆN (FULL INTEGRATION)
## (End-to-End API Integration Walkthrough for AdminUI & DoctorUI)

> **Người thực hiện:** Senior Fullstack Engineer kiêm Tech Lead HIS  
> **Thời điểm hoàn thành:** 2026-09-16  
> **Mục tiêu:** Tích hợp trực tiếp và gắn kết toàn bộ các Endpoint Backend thực tế vào các màn hình giao diện của cả phân hệ **AdminUI** và **DoctorUI**, bảo đảm dữ liệu đồng bộ hai chiều (Request / Response) theo đúng hợp đồng `01-api-contract.md` và `BACKEND_IMPLEMENTATION_WALKTHROUGH.md`.

---

## 1. TỔNG QUAN CÁC KẾT NỐI API ĐÃ TÍCH HỢP THÀNH CÔNG

```
                 [ CLINICMANAGEMENT.API (Backend .NET 8) ]
                                    ▲
                                    │ Axios Bearer JWT & Response Interceptor
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[ ClinicManagement.AdminUI ]               [ ClinicManagement.DoctorUI ]
- GET/POST /api/admin/roles                 - POST /api/LuotKham/{id}/start-exam
  (RoleManagementPage.jsx)                    (QueuePanel.tsx & ExamPanel.tsx)
- GET/POST /api/admin/audit-logs            - POST /api/LuotKham/{id}/examination
  (AuditLogPage.jsx)                          (ExaminationWorkspace.tsx)
- GET /api/admin/audit-logs/export          - POST /api/ai/drug-interaction-check
  (AuditLogPage.jsx CSV Download)             (TreatmentWorkspace.tsx)
- GET/POST /api/admin/integration-config    - POST /api/luot-kham/{id}/don-thuoc
  (IntegrationConfigPage.jsx)                 (TreatmentWorkspace.tsx)
                                            - POST /api/LuotKham/{id}/complete
                                              (ElectronicRecordWorkspace.tsx)
                                            - POST /api/luot-kham/{id}/emr/lock
                                              (ElectronicRecordWorkspace.tsx)
```

---

## 2. CHI TIẾT TÍCH HỢP TỪNG PHÂN HỆ GIAO DIỆN

### 2.1. Phân hệ Quản trị (`ClinicManagement.AdminUI`)

1. **Khởi tạo Client API Quản trị hệ thống (`settings/api/settings.api.ts`):**
   - Định nghĩa đầy đủ các Interface TypeScript: `RolePermissionMatrixDto`, `EmrAuditLogDto`, `IntegrationSettingDto`.
   - Cung cấp các hàm gọi API chuẩn RESTful sử dụng Axios instance có gắn JWT Bearer Token tự động.

2. **Tích hợp Ma trận Phân quyền & DataScope (`RoleManagementPage.jsx`):**
   - **Endpoint GET `/api/admin/roles`:** Tự động nạp danh sách vai trò và ma trận quyền từ máy chủ khi vào trang. Nếu máy chủ chưa có dữ liệu, chuyển tiếp mượt sang dữ liệu cấu hình ban đầu.
   - **Endpoint POST `/api/admin/roles`:** Khi người dùng thay đổi DataScope (`ALL_FACILITIES`, `FACILITY_ONLY`, `DEPARTMENT_ONLY`) hoặc tích chọn quyền module/action và nhấn "Lưu phân quyền", giao diện đóng gói payload `UpdateRolePermissionRequest` gửi lên backend lưu vào cơ sở dữ liệu qua một transaction an toàn.

3. **Tích hợp Nhật ký Kiểm toán Bệnh án (`AuditLogPage.jsx`):**
   - **Endpoint GET `/api/admin/audit-logs`:** Tải danh sách nhật ký truy cập EMR theo các tham số bộ lọc thời gian thực: `action` (`VIEW_RECORD`, `LOCK_RECORD`, `CREATE_INVOICE`...), `module` (`EMR`, `BILLING`, `INVENTORY`).
   - **Endpoint GET `/api/admin/audit-logs/export`:** Nút "Xuất CSV kiểm toán" kích hoạt gọi API tải stream blob nhị phân, tự động sinh và tải file `emr_audit_logs_YYYY-MM-DD.csv` về máy tính người dùng (giới hạn an toàn 10.000 dòng theo quy chuẩn backend).

4. **Tích hợp Cấu hình Tham số LIS / PACS / BHYT (`IntegrationConfigPage.jsx`):**
   - **Endpoint GET `/api/admin/integration-config`:** Nạp các tham số cổng LIS MLLP (Port 2575), PACS (AE Title) và BHYT (Mã CSKCB) từ backend.
   - **Endpoint POST `/api/admin/integration-config`:** Lưu đồng bộ và cập nhật ngay lập tức các cấu hình hạ tầng y tế mà không cần khởi động lại dịch vụ backend.

---

### 2.2. Phân hệ Bác sĩ Điều trị (`ClinicManagement.DoctorUI`)

1. **Tích hợp Hàng đợi & Tiếp nhận khám bệnh (`QueuePanel.tsx`):**
   - Kết nối trực tiếp API `POST /api/LuotKham/{id}/start-exam` khi bác sĩ bấm "Gọi khám" hoặc "Khám ngay" cho các ca cấp cứu `🚨 CẤP CỨU`.
   - Cơ chế polling chu kỳ 30 giây tự động làm mới danh sách bệnh nhân chờ khám từ backend.

2. **Tích hợp Kê đơn & Kiểm tra Tương tác Thuốc (`TreatmentWorkspace.tsx`):**
   - Kết nối API `GET /api/Thuoc/catalog?keyword=` để tìm kiếm thuốc kho Dược theo tên hoặc hoạt chất.
   - **Endpoint POST `/api/ai/drug-interaction-check`:** Mỗi khi bác sĩ thêm thuốc vào đơn, giao diện lập tức gửi danh sách thuốc cùng tiền sử dị ứng lên backend để phân tích. Nếu backend trả về cảnh báo `WARNING` hoặc `CRITICAL`, giao diện lập tức hiển thị hộp thoại cảnh báo tương tác thuốc hoặc sốc phản vệ.
   - **Endpoint POST `/api/luot-kham/{id}/don-thuoc`:** Gửi đơn thuốc hoàn chỉnh (gồm mã thuốc, liều dùng, số ngày, loại đơn BHYT/Tự túc) để lưu vào hồ sơ điều trị.

3. **Tích hợp Ký số & Khóa hồ sơ Bệnh án EMR (`ElectronicRecordWorkspace.tsx`):**
   - **Endpoint POST `/api/LuotKham/{id}/complete`:** Chốt hoàn tất lượt khám, kích hoạt MediatR Command trên backend tự động tạo Hóa đơn viện phí (`HoaDon`) sang trạng thái `CHO_THANH_TOAN` (theo đúng chuẩn FLOW-05).
   - **Endpoint POST `/api/luot-kham/{id}/emr/lock`:** Gửi chữ ký số bảo mật `SIG_...`, đóng băng toàn bộ hồ sơ EMR sang chế độ Read-only bất biến theo Thông tư 46/2018/TT-BYT.

---

## 3. KẾT QUẢ KIỂM THỬ TÍCH HỢP (INTEGRATION VALIDATION)

> Cập nhật sau rà soát ngày 16/09/2026: các trạng thái dưới đây chỉ được xác nhận ở mức contract/source review nếu chưa có log chạy trên database thật. Không kết luận 100% end-to-end chỉ dựa trên việc UI có hàm gọi API.

| Kịch bản kiểm thử tích hợp (End-to-End Test Case) | Kết quả giao diện UI | Kết quả Backend Database | Trạng thái |
|---|---|---|:---:|
| **TC-01: Bác sĩ bắt đầu khám bệnh nhân hàng đợi** | Có UI gọi đúng route. | Cần chạy DB/API thật để xác nhận trạng thái và phân bác sĩ. | ⚠️ Cần kiểm thử |
| **TC-02: Bác sĩ kê thuốc trùng tiền sử dị ứng** | UI đã đồng bộ response object `alerts`. | Backend đã đọc tiền sử dị ứng/hoạt chất; cần dữ liệu thật để xác nhận cảnh báo. | ⚠️ Cần kiểm thử |
| **TC-03: Ký số và Hoàn tất lượt khám** | UI gọi validate → complete → lock. | Đã có cột khóa EMR, cần chạy migration và kiểm thử read-only. | ⚠️ Cần kiểm thử |
| **TC-04: Cập nhật ma trận phân quyền Admin** | UI gửi payload role matrix. | Có repository/migration lưu bảng quyền; cần seed role và kiểm thử 401/403. | ⚠️ Cần kiểm thử |
| **TC-05: Xuất nhật ký kiểm toán EMR ra CSV** | UI tải blob CSV. | Có filter module/action và giới hạn 10.000 dòng; cần kiểm thử database thật. | ⚠️ Cần kiểm thử |

Các route chính đã được đồng bộ ở mức source contract. Chưa đủ bằng chứng để xác nhận tích hợp end-to-end 100%; cần chạy migration, khởi động SQL Server/API và thực hiện các test case với request/response/database record thật.
