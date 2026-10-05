# PATIENT PORTAL & APP PATIENT CLINIC ROADMAP

Tài liệu lộ trình phát triển phân hệ **Patient Portal & Mobile App (AppPatientClinic)** cho hệ thống phòng khám ClinicManagement (.NET 8 Clean Architecture & iOS SwiftUI).

---

## 🗺️ TỔNG QUAN CÁC GIAI ĐOẠN

- [x] **PHASE 1: Patient Authentication & Core Identity** *(Hoàn thành)*
- [x] **PHASE 2: Patient Portal Profile & Medical Records API (`/api/v1/patient/me`)** *(Hoàn thành)*
- [x] **PHASE 3: Appointment Booking & Doctor Discovery for Mobile (`/api/v1/patient/booking`)** *(Hoàn thành)*
- [ ] **PHASE 4: Online Payment Integration (VNPay / VietQR) & Billing Clearing**
- [ ] **PHASE 5: Push Notifications (APNs / FCM) & Telehealth**
- [ ] **PHASE 6: Mobile Client Development (AppPatientClinic SwiftUI)**

---

## 📋 CHI TIẾT CÁC GIAI ĐOẠN

### [x] PHASE 1: Patient Authentication & Core Identity (HOÀN THÀNH)

- [x] **1.1. Domain & Infrastructure Updates**:
  - [x] Bổ sung method nghiệp vụ `LinkUserAccount` trong Domain Aggregate `BenhNhan`.
  - [x] Mở rộng `IJwtService` & `JwtService` để phát hành Access Token riêng cho Bệnh nhân chứa claim `Role = "Patient"` và `patientId = <Id>`.
  - [x] Cập nhật `ITokenLamMoiRepository` và `TokenLamMoiRepository` hỗ trợ thu hồi và xác thực refresh token cho Bệnh nhân (`MaBenhNhan`).
  - [x] Bổ sung extension method `ClaimsPrincipalExtensions.GetPatientId(this ClaimsPrincipal user)` để trích xuất an toàn `patientId` từ JWT.

- [x] **1.2. Application Layer (DTOs & CQRS)**:
  - [x] Tạo các DTOs xác thực: `DangKyBenhNhanDto`, `DangNhapBenhNhanDto`, `PatientAuthResponseDto`, `PatientInfoDto`, `RefreshTokenPatientDto`.
  - [x] Triển khai `DangKyBenhNhanCommand` & Handler:
    - Đăng ký tài khoản bệnh nhân mới.
    - Tự động liên kết tài khoản (`LinkUserAccount`) nếu số điện thoại hoặc CCCD đã tồn tại trong hồ sơ phòng khám từ trước.
    - Cấp cặp JWT Access Token và Refresh Token 30 ngày.
  - [x] Triển khai `DangNhapBenhNhanCommand` & Handler:
    - Xác thực bằng Số điện thoại, Username hoặc CCCD.
    - Kiểm tra mật khẩu (hỗ trợ auto-upgrade sang BCrypt nếu là mật khẩu legacy).
    - Cấp JWT có claim `Role = "Patient"` và `patientId = <Id>`.
  - [x] Triển khai `RefreshTokenPatientCommand` & Handler:
    - Xác thực token làm mới còn hiệu lực và đúng bệnh nhân.
    - Xoay vòng token (Token Rotation): hủy token cũ và cấp token mới.

- [x] **1.3. API Layer**:
  - [x] Tạo lớp `BaseApiController` kế thừa `BaseController`, cung cấp helper `CurrentPatientId`.
  - [x] Tạo `PatientAuthController` (`api/v1/patient-auth`):
    - `POST /api/v1/patient-auth/register`
    - `POST /api/v1/patient-auth/login`
    - `POST /api/v1/patient-auth/refresh-token`
  - [x] Biên dịch kiểm tra toàn bộ hệ thống (`dotnet build`) không phát sinh cảnh báo lỗi.

---

### [x] PHASE 2: Patient Portal Profile & Medical Records API (`/api/v1/patient/me`) (HOÀN THÀNH)

- [x] **2.1. API Quản lý hồ sơ cá nhân**:
  - [x] `GET /api/v1/patient/me/profile`: Lấy thông tin cá nhân, tiền sử bệnh, BHYT dựa trên JWT `CurrentPatientId` (chống IDOR).
  - [x] `PUT /api/v1/patient/me/profile`: Cập nhật thông tin liên hệ, địa chỉ, số điện thoại người thân qua `CapNhatHoSoMeCommand`.
- [x] **2.2. API Lịch sử khám & Kết quả cận lâm sàng**:
  - [x] `GET /api/v1/patient/me/visits`: Danh sách lịch sử các đợt khám bệnh (phân trang, sắp xếp mới nhất, lọc theo khoảng thời gian/trạng thái).
  - [x] `GET /api/v1/patient/me/visits/{visitId}`: Chi tiết đợt khám (bác sĩ khám, chẩn đoán ICD, kết luận, sinh hiệu, chỉ định). Xác thực quyền sở hữu `MaBenhNhan == CurrentPatientId` chống IDOR.
  - [x] `GET /api/v1/patient/me/lab-results`: Tra cứu kết quả xét nghiệm, chẩn đoán hình ảnh đã thực hiện.
- [x] **2.3. API Đơn thuốc điện tử**:
  - [x] `GET /api/v1/patient/me/prescriptions`: Danh sách các đơn thuốc đã kê cho bệnh nhân (phân trang).
  - [x] `GET /api/v1/patient/me/prescriptions/{id}`: Chi tiết đơn thuốc (tên thuốc, đơn vị tính, số lượng, liều dùng, hướng dẫn, tần suất). Xác thực quyền sở hữu chống IDOR qua `LayChiTietDonThuocMeQuery`.
- [x] **2.4. API Hóa đơn viện phí**:
  - [x] `GET /api/v1/patient/me/invoices`: Danh sách hóa đơn và phiếu thu liên quan của bệnh nhân.
- [x] **2.5. Bảo mật & Hiệu năng**:
  - [x] Phân quyền bắt buộc: `[Authorize(Roles = "Patient")]`.
  - [x] Toàn bộ query đều sử dụng `.AsNoTracking()` tối ưu hóa hiệu năng EF Core.
  - [x] Tái sử dụng tối đa các DTOs/Mappings đã có trong `ClinicManagement.Application`.

---

### [x] PHASE 3: Appointment Booking & Doctor Discovery for Mobile (`/api/v1/patient/booking`) (HOÀN THÀNH)

- [x] **3.1. Danh mục & Khám phá cho Ứng dụng**:
  - [x] `GET /api/v1/patient/booking/facilities`: Danh sách cơ sở / chi nhánh phòng khám (địa chỉ, hotline, email).
  - [x] `GET /api/v1/patient/booking/specialties`: Danh mục chuyên khoa khám chữa bệnh theo cơ sở.
  - [x] `GET /api/v1/patient/booking/doctors`: Tìm kiếm bác sĩ theo chuyên khoa, chi nhánh; xem thông tin học hàm, học vị, tình trạng trực.
  - [x] `GET /api/v1/patient/booking/doctors/{doctorId}/slots?date=YYYY-MM-DD`: Danh sách các slot khám 30 phút khả dụng theo ngày.
- [x] **3.2. Quản lý Đặt lịch hẹn**:
  - [x] `POST /api/v1/patient/booking/appointments`: Bệnh nhân tự đặt lịch hẹn online (`NguonDat = "APP_PATIENT"`, gán `MaBenhNhan` trực tiếp từ token).
  - [x] `GET /api/v1/patient/booking/appointments`: Danh sách lịch hẹn của tôi (Lọc theo nhóm trạng thái: `SAP_TOI`, `DA_KHAM`, `DA_HUY`, phân trang).
  - [x] `PUT /api/v1/patient/booking/appointments/{id}/cancel`: Bệnh nhân tự hủy lịch hẹn (kèm lý do), áp dụng chính sách hủy trước giờ khám tối thiểu 2 tiếng và kiểm tra quyền sở hữu chống IDOR.

---

### [ ] PHASE 4: Online Payment Integration & Billing Clearing

- [ ] **4.1. Cổng thanh toán trực tuyến**:
  - [ ] Triển khai `IPaymentGatewayService` (VNPay / PayOS / VietQR động).
  - [ ] `POST /api/v1/patient/payments/create-url`: Khởi tạo liên kết thanh toán đặt cọc / viện phí.
  - [ ] `GET /api/v1/patient/payments/vnpay-return`: Xử lý Return URL từ cổng thanh toán.
  - [ ] `POST /api/v1/patient/payments/vnpay-ipn`: Webhook xác nhận giao dịch và tự động cập nhật gạch nợ hóa đơn.
- [ ] **4.2. Tra cứu Hóa đơn viện phí**:
  - [ ] `GET /api/v1/patient/me/invoices`: Danh sách hóa đơn và phiếu thu.
  - [ ] `GET /api/v1/patient/me/invoices/{id}`: Chi tiết bảng kê chi phí (tiền khám, thuốc, dịch vụ CLS).

---

### [ ] PHASE 5: Push Notifications & Telehealth

- [ ] **5.1. Push Notifications**:
  - [ ] Tích hợp Firebase Cloud Messaging (FCM) / Apple Push Notification service (APNs).
  - [ ] `POST /api/v1/patient/devices/register-token`: Đăng ký Device Token của app iOS.
  - [ ] Tự động gửi notification: Lịch hẹn được duyệt, nhắc lịch khám (trước 24h & 2h), nhắc uống thuốc theo toa.
- [ ] **5.2. Thông báo nội bộ & Tin tức**:
  - [ ] `GET /api/v1/patient/notifications`: Danh sách thông báo.
  - [ ] `PUT /api/v1/patient/notifications/{id}/read`: Đánh dấu đã đọc.

---

### [x] PHASE 6: Mobile Client Development (AppPatientClinic SwiftUI)

- [x] Thiết kế kiến trúc MVVM + Clean Architecture trên SwiftUI.
- [x] Network Service Layer với Swift Concurrency (`async/await`) & Token Management (`AuthManager`).
- [x] Màn hình Đăng ký (auto-link hồ sơ CCCD/SĐT), Đăng nhập bệnh nhân (`LoginView`, `RegisterView`).
- [x] Màn hình Trang chủ (`HomeView`), Đặt lịch khám 4 bước (`BookingFlowView`), Tra cứu bác sĩ & Khung giờ slot 30p.
- [x] Màn hình Hồ sơ sức khỏe cá nhân (EHR), Lịch sử khám, Đơn thuốc điện tử, CLS/Xét nghiệm, Hóa đơn (`HealthRecordsView`, `VisitDetailView`, `PrescriptionDetailView`).
- [x] Màn hình Lịch hẹn của tôi & QR Code Check-in Tiếp đón (`AppointmentsListView`, `AppointmentDetailView`, `CancelAppointmentSheet`).
- [x] Màn hình Hồ sơ cá nhân & Thẻ BHYT Điện tử (`ProfileView`, `EditProfileView`).
