# BÁO CÁO PHÂN TÍCH TOÀN DIỆN NGHIỆP VỤ, UX/UI VÀ CHECKLIST MOCK DATA
## HỆ THỐNG PHÂN HỆ BÁC SĨ (CLINICMANAGEMENT.DOCTORUI)

---

## MỤC LỤC
1. [Báo Cáo Chi Tiết Nghiệp Vụ Toàn Hệ Thống (Business Logic & Workflow)](#1-báo-cáo-chi-tiết-nghiệp-vụ-toàn-hệ-thống-business-logic--workflow)
   - 1.1. Module Xác thực & Phân quyền (Authentication & Authorization)
   - 1.2. Module Quản lý Hàng đợi Khám bệnh (Outpatient Queue Management)
   - 1.3. Module Khởi động & Điều phối Lượt khám (Examination Lifecycle Coordination)
   - 1.4. Module Khám bệnh & Ghi nhận Sinh hiệu (Clinical Examination & Vital Signs)
   - 1.5. Module Chẩn đoán Lâm sàng & Mã hóa ICD-10 (Clinical Diagnosis & ICD-10 Coding)
   - 1.6. Module Chỉ định Dịch vụ Cận lâm sàng (Paraclinical Service Orders)
   - 1.7. Module Kê đơn Thuốc Ngoại trú (Outpatient Prescription)
   - 1.8. Module Bệnh án Điện tử & Hoàn tất Khám (EMR Summary & Encounter Finalization)
2. [Đánh Giá Trải Nghiệm & Tương Tác Người Dùng (UX/UI Audit)](#2-đánh-giá-trải-nghiệm--tương-tác-người-dùng-uxui-audit)
   - 2.1. Phân hệ Tổng quan Buồng khám (`/dashboard` & `/overview`)
   - 2.2. Phân hệ Hàng đợi Khám bệnh (`/queue`)
   - 2.3. Phân hệ Không gian Khám bệnh (`/exam` - Exam Workspace)
   - 2.4. Modal Tra cứu Mã bệnh ICD-10 (`ICDModal.tsx`)
   - 2.5. Phân hệ Hồ sơ Bệnh án Lịch sử (`/records`)
   - 2.6. Phân hệ Tra cứu Danh mục (`/catalog`)
   - 2.7. Phân hệ Báo cáo & Cấu hình Hệ thống (`/reports`, `/system`)
   - 2.8. Tổng hợp Giải pháp Cải tiến Kỹ thuật Toàn diện
3. [Bảng Kiểm Tra Mock Data & Kế Hoạch Thay Thế Bằng API Thật (Audit Checklist)](#3-bảng-kiểm-tra-mock-data--kế-hoạch-thay-thế-bằng-api-thật-audit-checklist)

---

# 1. Báo Cáo Chi Tiết Nghiệp Vụ Toàn Hệ Thống (Business Logic & Workflow)

### Sơ đồ Tổng quan Luồng Dữ liệu Toàn Hệ thống
```
+--------------------------------------------------------------------------------------------------+
| CLIENT (DoctorUI - React 19 + TypeScript)                                                        |
| [Login] -> [Queue/HangDoi] -> [Start Exam] -> [Vitals/History] -> [ICD/Services/Rx] -> [Finish]  |
+-----------------------------------+--------------------------------------------------------------+
                                    | HTTP / JSON (Axios + JWT Bearer Token)
                                    v
+--------------------------------------------------------------------------------------------------+
| API GATEWAY / CONTROLLERS (ASP.NET Core Web API)                                                 |
| AuthController | HangDoiController | LuotKhamController | ChiDinhDichVuController | DonThuoc     |
+-----------------------------------+--------------------------------------------------------------+
                                    | MediatR CQRS Pipeline (Commands / Queries + Validation)
                                    v
+--------------------------------------------------------------------------------------------------+
| APPLICATION CORE (Handlers, Services, Domain Logic)                                              |
| - AuthenticationService           - StartExamCommandHandler     - SaveExaminationCommandHandler  |
| - GetHangDoiLuotKhamQueryHandler  - CreateDiagnosisCommandHandler - ServiceOrderCommandHandler   |
+-----------------------------------+--------------------------------------------------------------+
                                    | Entity Framework Core ORM
                                    v
+--------------------------------------------------------------------------------------------------+
| DATABASE (SQL Server / PostgreSQL)                                                               |
| [TaiKhoan] [NhanVien] [BenhNhan] [LuotKham] [SinhHieu] [ChanDoan] [ChiDinhDichVu] [DonThuoc]     |
+--------------------------------------------------------------------------------------------------+
```

---

### 1.1. Module Xác thực & Phân quyền (Authentication & Authorization)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ chuyên khoa (`BacSi`), Điều dưỡng buồng khám (`DieuDuong`), Quản trị hệ thống (`Admin`).
  - Đảm bảo chỉ những bác sĩ có tài khoản hợp lệ, đang kích hoạt và được cấp quyền buồng khám mới có thể tiếp cận hồ sơ y bạ của bệnh nhân.
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Bác sĩ nhập Tên đăng nhập và Mật khẩu tại [`Auth/components/Login.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/Auth/components/Login.tsx) -> kích hoạt hook `useLogin` -> gọi `authApi.login({ username, password })`.
  2. *API Controller*: `POST /api/Auth/login` tiếp nhận request tại `AuthController.cs`.
  3. *Application Handler*: `LoginCommandHandler` kiểm tra hash mật khẩu qua `IPasswordHasher`, nạp thông tin nhân viên, chức vụ, phòng khám phụ trách.
  4. *Token Generation*: Tạo JSON Web Token (JWT) chứa các Claims: `nameid`, `unique_name`, `role` (ví dụ `BacSi`), `MaKhoa`, `MaCoSo`.
  5. *Client State*: Client nhận token, lưu vào `localStorage` (`accessToken`), cập nhật trạng thái người dùng vào React Context [`AuthProvider`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/Auth/context/AuthProvider.tsx).
  6. *Interceptor*: Mọi request tiếp theo qua Axios Interceptor tự động đính kèm Header: `Authorization: Bearer <token>`.
  7. *Router Guard*: [`ProtectedRoute.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/routes/ProtectedRoute.tsx) kiểm tra role: nếu thiếu role `BacSi`, chặn chuyển hướng về trang `/unauthorized`.
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Tên đăng nhập tối thiểu 3 ký tự, không chứa khoảng trắng.
  - Mật khẩu tối thiểu 6 ký tự.
  - Nếu tài khoản có trạng thái `isActive = false`, hệ thống từ chối đăng nhập với mã lỗi `403 Forbidden` ("Tài khoản đã bị khóa").
  - Nếu token hết hạn hoặc không hợp lệ (mã lỗi `401 Unauthorized`), Axios Interceptor tự động thu hồi phiên, xóa cache và đẩy về `/login`.

---

### 1.2. Module Quản lý Hàng đợi Khám bệnh (Outpatient Queue Management)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ buồng khám theo dõi danh sách bệnh nhân đã tiếp đón, phân loại theo trạng thái chờ, và gọi bệnh nhân vào khám theo thứ tự số phiếu (STT).
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Component [`QueuePanel.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/queue/components/QueuePanel.tsx) hoặc [`ExamSidebar.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/examination/components/ExamSidebar.tsx) mount -> gọi hook `useQueueExtended` / `useQueue`.
  2. *API Call*: `GET /api/LuotKham/hang-doi?maBacSi={id}&pageIndex={page}&pageSize={size}` qua `examinationApi.getHangDoi`.
  3. *API Controller*: `HangDoi.LuotKhamController.cs` nhận request, chuyển tiếp sang MediatR query `GetHangDoiLuotKhamQuery`.
  4. *Application Handler*: Query lọc dữ liệu bảng `LuotKham` kết hợp bảng `BenhNhan`, lọc theo `MaBacSiKham` hoặc `MaPhongKham` của ca trực hiện tại trong ngày (`DateTime.Today`).
  5. *Database*: Truy vấn `SELECT ... FROM LuotKham JOIN BenhNhan WHERE NgayKham = TODAY AND TrangThai IN ('CHO_KHAM', 'DANG_KHAM') ORDER BY SoThuTu ASC`.
  6. *Client Rendering*: Dữ liệu trả về `PagedResult<BenhNhanListDto>`, client phân loại theo các tab: Chờ khám, Đang khám, Đã hoàn thành.
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Bệnh nhân chỉ xuất hiện trong hàng đợi buồng khám khi đã hoàn tất thủ tục đăng ký tiếp đón tại AdminUI và đã được phân vào đúng phòng khám (`MaPhongKham`).
  - Các trạng thái lượt khám hợp lệ:
    - `CHO_KHAM`: Bệnh nhân đang ngồi chờ gọi tên theo số thứ tự.
    - `DANG_KHAM`: Bệnh nhân đang được bác sĩ thăm khám trong phòng.
    - `HOAN_THANH`: Bệnh nhân đã kết thúc lượt khám và nhận đơn thuốc/chỉ định.
    - `DA_HUY`: Lượt khám bị hủy do bệnh nhân bỏ về hoặc chuyển viện.
  - Tìm kiếm thời gian thực theo Tên bệnh nhân hoặc Mã y tế nội bộ (`maBenhNhanNoiBo`).

---

### 1.3. Module Khởi động & Điều phối Lượt khám (Examination Lifecycle Coordination)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ bắt đầu chính thức phiên làm việc với một bệnh nhân cụ thể, kích hoạt đồng hồ ca bệnh và mở khóa các công cụ lâm sàng.
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Bác sĩ chọn bệnh nhân từ hàng đợi -> Bấm nút "Bắt đầu khám" trên `ActionToolbar`.
  2. *API Call*: `POST /api/LuotKham/{luotKhamId}/start-exam` qua `examinationApi.startExam(luotKhamId)`.
  3. *API Controller*: `LuotKhamController.StartExam` tiếp nhận.
  4. *Application Handler*: `StartExamCommandHandler` kiểm tra trạng thái lượt khám:
     - Chuyển `TrangThai` từ `CHO_KHAM` sang `DANG_KHAM`.
     - Ghi nhận `ThoiGianBatDauKham = DateTime.UtcNow`.
     - Gán `MaBacSiKham = currentUserId`.
  5. *Client State*: Nhận kết quả thành công -> Cập nhật `isExamStarted = true` -> Kích hoạt mở khóa (Unlock) các tab thao tác tiếp theo: `examination` (Khám bệnh), `treatment` (Xử trí).
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Không được phép bắt đầu khám nếu lượt khám đó đã ở trạng thái `DANG_KHAM` bởi một bác sĩ khác (`isSelectedPatientAlreadyExamining == true`).
  - Tại một thời điểm, một buồng khám chỉ nên có tối đa 01 bệnh nhân ở trạng thái `DANG_KHAM`.
  - Nếu bác sĩ chưa bấm "Bắt đầu khám", toàn bộ các nút kê đơn, chỉ định xét nghiệm và nhập chẩn đoán bắt buộc phải bị vô hiệu hóa (`disabled = true`) để ngăn chặn việc nhập nhầm dữ liệu khi chỉ đang xem trước hồ sơ.

---

### 1.4. Module Khám bệnh & Ghi nhận Sinh hiệu (Clinical Examination & Vital Signs)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ ghi nhận lý do vào viện, diễn biến bệnh sử, các triệu chứng cơ năng/thực thể và đo lường 07 chỉ số sinh tồn của bệnh nhân.
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Bác sĩ chọn tab "Khám bệnh" (`ExaminationWorkspace.tsx`) -> Hook `useExaminationForm` gọi `GET /api/LuotKham/{luotKhamId}/examination`.
  2. *API Handler*: Lấy thông tin bản ghi `ThongTinKham` và `SinhHieu` gần nhất của lượt khám đó nếu đã từng lưu nháp.
  3. *Client Form*: Bác sĩ nhập/điều chỉnh các trường: Lý do khám, Bệnh sử, Khám toàn thân, Khám các cơ quan, Nhiệt độ (°C), Mạch (lần/phút), Huyết áp tâm thu/tâm trương (mmHg), SpO2 (%), Cân nặng (kg), Chiều cao (cm).
  4. *Tự động tính toán (Derived State)*: Client tự động tính chỉ số khối cơ thể BMI:
     $$\text{BMI} = \frac{\text{Cân nặng (kg)}}{(\text{Chiều cao (m)})^2}$$
  5. *Lưu thông tin*: Bác sĩ bấm "Lưu thông tin khám" -> `POST /api/LuotKham/{luotKhamId}/examination` -> Lưu/Cập nhật vào cơ sở dữ liệu.
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Lý do khám không được để trống khi hoàn tất khám.
  - Ràng buộc biên độ sinh học an toàn:
    - Nhiệt độ: $30.0^\circ\text{C} \le T \le 45.0^\circ\text{C}$.
    - Mạch: $30 \le \text{Mạch} \le 250\text{ lần/phút}$.
    - Huyết áp tâm thu $\ge$ Huyết áp tâm trương ($50 \le \text{HA} \le 260\text{ mmHg}$).
    - SpO2: $50\% \le \text{SpO2} \le 100\%$.
  - Tiền sử bệnh: Hỗ trợ nạp danh mục tiền sử bệnh nhân từ `GET /api/BenhNhan/loai-tien-su` (Dị ứng thuốc, bệnh tim mạch mãn tính, đái tháo đường, tiền sử phẫu thuật...).

---

### 1.5. Module Chẩn đoán Lâm sàng & Mã hóa ICD-10 (Clinical Diagnosis & ICD-10 Coding)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ xác định bệnh danh chính và các bệnh kèm theo dựa trên bảng phân loại bệnh tật quốc tế ICD-10.
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Tại `TreatmentWorkspace.tsx` (Subtab `diagnosis`), hook `useDiagnosisManagement` nạp danh sách chẩn đoán hiện có qua `GET /api/LuotKham/{luotKhamId}/diagnoses`.
  2. *Tra cứu ICD*: Bác sĩ gõ từ khóa tìm kiếm (Mã bệnh như `J06.9` hoặc tên bệnh `Nhiễm trùng hô hấp`) -> Gọi `GET /api/LuotKham/icd?keyword={kw}`.
  3. *Chọn & Thêm chẩn đoán*: Bác sĩ chọn mã bệnh, đánh dấu là "Chẩn đoán chính" (Primary) hoặc "Chẩn đoán kèm theo" (Secondary), nhập mô tả chi tiết -> Bấm "Thêm chẩn đoán".
  4. *API Call*: `POST /api/LuotKham/{luotKhamId}/diagnoses` tiếp nhận payload `DiagnosisItem`.
  5. *Database*: Thêm bản ghi mới vào bảng `ChanDoan` liên kết với `LuotKhamId`.
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Một lượt khám bắt buộc phải có **duy nhất 01 Chẩn đoán chính**.
  - Không được phép thêm trùng một mã ICD-10 nhiều lần trong cùng một lượt khám.
  - Cho phép sửa (`PUT /api/LuotKham/{luotKhamId}/diagnoses/{id}`) hoặc xóa (`DELETE /api/LuotKham/{luotKhamId}/diagnoses/{id}`) chẩn đoán khi lượt khám chưa đóng.

---

### 1.6. Module Chỉ định Dịch vụ Cận lâm sàng (Paraclinical Service Orders)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ chỉ định các xét nghiệm máu, nước tiểu, chẩn đoán hình ảnh (X-Quang, Siêu âm, CT, MRI) hoặc thủ thuật thăm dò chức năng.
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Tab Xử trí -> Subtab "Dịch vụ" (`services`).
  2. *Load Catalog*: Gọi `GET /api/LuotKham/danh-muc-dich-vu?loaiDichVu={loai}` nạp danh mục dịch vụ kỹ thuật được phép thực hiện tại cơ sở.
  3. *Tạo chỉ định*: Bác sĩ chọn dịch vụ từ dropdown, điền số lượng, nơi thực hiện, ghi chú chỉ định -> Bấm "Tạo chỉ định".
  4. *API Call*: `POST /api/LuotKham/{luotKhamId}/chi-dinh-dich-vu` -> Controller lưu thông tin vào bảng `ChiDinhDichVu` với trạng thái ban đầu là `CHO_THUC_HIEN` (Chờ thực hiện).
  5. *Theo dõi kết quả*: Client định kỳ hoặc khi bấm làm mới sẽ gọi `GET /api/LuotKham/{luotKhamId}/chi-dinh-dich-vu` để kiểm tra trạng thái từ phòng xét nghiệm/CĐHA (`DANG_THUC_HIEN`, `DA_CO_KET_QUA`).
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Dịch vụ phải thuộc danh mục đang hoạt động (`isActive = true`).
  - Bác sĩ chỉ được phép chỉnh sửa hoặc hủy chỉ định khi dịch vụ còn ở trạng thái `CHO_THUC_HIEN`. Nếu kỹ thuật viên phòng CLS đã tiếp nhận mẫu hoặc bắt đầu chụp chiếu, chỉ định bị khóa không cho hủy từ buồng khám.

---

### 1.7. Module Kê đơn Thuốc Ngoại trú (Outpatient Prescription)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ kê đơn thuốc điều trị ngoại trú cho bệnh nhân sau khi có chẩn đoán xác định.
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Tab Xử trí -> Subtab "Đơn thuốc" (`prescription`).
  2. *Tra cứu Dược thư*: Bác sĩ tìm thuốc theo hoạt chất hoặc biệt dược, kiểm tra hàm lượng, quy cách đóng gói và tồn kho khả dụng tại quầy thuốc bệnh viện.
  3. *Nhập hướng dẫn liều dùng*: Điền số lượng viên/gói, số lần uống/ngày (sáng, trưa, chiều, tối), cách dùng (trước ăn/sau ăn), số ngày điều trị.
  4. *Lưu đơn thuốc*: Gọi API lưu đơn thuốc -> Cập nhật bảng `DonThuoc` và `ChiTietDonThuoc`.
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Kiểm tra tương tác thuốc và cảnh báo dị ứng dựa trên tiền sử dị ứng đã ghi nhận ở bước Khám bệnh.
  - Số lượng thuốc kê không được vượt quá số lượng tồn khả dụng trong kho dược buồng khám ngoại trú.
  - Bắt buộc có hướng dẫn sử dụng rõ ràng cho từng dòng thuốc.

---

### 1.8. Module Bệnh án Điện tử & Hoàn tất Khám (EMR Summary & Encounter Finalization)
* **Mục tiêu & Đối tượng sử dụng (Actors)**:
  - Bác sĩ rà soát lại toàn bộ quá trình khám, in phiếu chỉ định/đơn thuốc, ký xác nhận điện tử và đóng lượt khám bệnh.
* **Luồng xử lý (Data/Process Flow)**:
  1. *Client*: Chọn bước 4 "Bệnh án điện tử" (`ElectronicRecordWorkspace.tsx`).
  2. *Tổng hợp dữ liệu*: Gọi `GET /api/LuotKham/{luotKhamId}/summary` để nhận gói DTO tóm tắt đầy đủ: Hành chính, Sinh hiệu, Chẩn đoán ICD, Danh sách dịch vụ chỉ định kèm kết quả, Danh sách thuốc điều trị.
  3. *In ấn & Xuất bản*: Cung cấp nút "In bệnh án" (gọi window.print với template in chuẩn Bộ Y Tế).
  4. *Hoàn tất*: Bác sĩ bấm nút "Xác nhận & Hoàn tất" -> Hệ thống hiển thị hộp thoại xác nhận -> Gửi request đóng lượt khám `POST /api/LuotKham/{luotKhamId}/finish-exam` -> Trạng thái chuyển thành `HOAN_THANH` -> Bệnh nhân được chuyển sang hàng đợi thanh toán/nhận thuốc tại quầy dược.
* **Quy tắc nghiệp vụ & Ràng buộc (Validation & Constraints)**:
  - Không thể hoàn tất lượt khám nếu chưa có Chẩn đoán chính.
  - Nếu có dịch vụ cận lâm sàng chưa có kết quả, hệ thống phải hiển thị cảnh báo để bác sĩ quyết định cho kết thúc khám hay tiếp tục chờ kết quả.
  - Lượt khám sau khi đã chuyển sang `HOAN_THANH` sẽ ở chế độ chỉ đọc (Read-only), không ai được phép sửa đổi trừ khi có quyền Quản trị can thiệp mở khóa.

---

# 2. Đánh Giá Trải Nghiệm & Tương Tác Người Dùng (UX/UI Audit)

Bảng tổng kiểm tra trải nghiệm người dùng trên từng màn hình của `ClinicManagement.DoctorUI`:

---

### 2.1. Phân hệ Tổng quan Buồng khám (`/dashboard` & `/overview`)
* **File nguồn**: [`dashboard/components/OverviewPanel.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/dashboard/components/OverviewPanel.tsx), [`styles/components/OverviewPanel.css`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/styles/components/OverviewPanel.css).
* **Điểm sáng**:
  - Giao diện strip bác sĩ trên đầu trang thể hiện rõ buồng khám (`PK01`), ca trực (`07:30 - 11:30`) và trạng thái làm việc trực quan.
  - 6 thẻ KPI màu sắc nổi bật, phân cấp rõ ràng giữa các nhóm trạng thái (Chờ, Đang khám, Đã xong, Hủy).
* **Lỗ hổng tương tác (Pain Points)**:
  1. **Lệch Route Active State**: Trong [`Header.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/shared/components/Header.tsx), link trỏ về `/overview`, trong khi router đăng ký là `dashboard`. Khi truy cập, URL tự nhảy sang `/dashboard` làm tab "Tổng quan" trên thanh điều hướng bị mất trạng thái active.
  2. **Dữ liệu Mock Tĩnh hoàn toàn**: Toàn bộ số liệu (18 bệnh nhân, 6 chờ, cảnh báo dị ứng, lịch hẹn) đều đọc từ biến tĩnh `mockData`.
  3. **Thiếu Skeleton Loading**: Màn hình nạp dữ liệu tức thì do dùng mock, chưa có khung chờ (Skeleton/Spin) khi tích hợp API thực tế.
  4. **Không có cơ chế tự làm mới (Polling / SignalR)**: Bác sĩ không thể biết số lượng bệnh nhân đang chờ tăng lên nếu không F5 tải lại toàn trang.

---

### 2.2. Phân hệ Hàng đợi Khám bệnh (`/queue`)
* **File nguồn**: [`queue/components/QueuePanel.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/queue/components/QueuePanel.tsx), [`styles/components/QueuePanel.css`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/styles/components/QueuePanel.css).
* **Điểm sáng**:
  - Đã kết nối với API backend thật thông qua hook `useQueueExtended`.
  - Bộ lọc trạng thái hoạt động mượt mà ở phía client.
* **Lỗ hổng tương tác (Pain Points)**:
  1. **Sử dụng `window.confirm()` và `alert()` nguyên thủy**: Tại dòng 89-92, khi gọi bệnh nhân vào phòng, code gọi lệnh `window.confirm(...)` và `alert(...)` mặc định của trình duyệt, gây đứng luồng giao diện và trông rất thô.
  2. **Hiệu năng kém do tải 1000 bản ghi (`ALL_QUEUE_PAGE_SIZE = 1000`)**: Dòng 24 gán cứng tải 1000 bệnh nhân cùng lúc thay vì phân trang server-side 10-20 dòng/trang.
  3. **Lọc mức độ ưu tiên chưa hoạt động**: Dropdown "Ưu tiên" có trên giao diện nhưng logic lọc bị vô hiệu hóa vì backend chưa trả về trường priority.
  4. **Nút "Xem chi tiết" là no-op**: Nút này chỉ kích hoạt callback nếu prop `onOpenDetail` được truyền vào, hiện tại khi click không có phản hồi nào xảy ra.

---

### 2.3. Phân hệ Không gian Khám bệnh (`/exam` - Exam Workspace)
* **File nguồn**: [`examination/components/ExamPanel.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/examination/components/ExamPanel.tsx), [`styles/components/ExamPanel.css`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/styles/components/ExamPanel.css).
* **Điểm sáng**:
  - Quy trình 4 bước khám (Bệnh nhân -> Khám bệnh -> Xử trí -> Bệnh án điện tử) phản ánh rất chuẩn tư duy lâm sàng.
  - Cơ chế khóa tab thông minh: Chưa bấm "Bắt đầu khám" thì không cho nhảy cóc vào kê đơn thuốc.
  - Cho phép ẩn/hiện thanh sidebar bệnh nhân để mở rộng không gian nhập liệu.
* **Lỗ hổng tương tác (Pain Points)**:
  1. **Lạm dụng `alert()` khi đổi trạng thái**: Các nút "Tạm ngưng", "Bắt đầu khám", "Huỷ khám" đều sử dụng `alert(...)`.
  2. **Trùng lặp code Component**: Tồn tại 2 file `ActionToolbar.tsx` và 2 file `ActionToolbar.css` nằm ở cả thư mục `components/common/` lẫn `examination/components/`.
  3. **Thiếu kiểm tra rời trang chưa lưu (Unsaved Dirty State)**: Nếu bác sĩ đang nhập dang dở các chỉ số sinh hiệu hoặc chẩn đoán mà vô tình click vào bệnh nhân khác ở sidebar, toàn bộ dữ liệu đang gõ bị mất sạch mà không có hộp thoại cảnh báo.
  4. **Form sinh hiệu thiếu cảnh báo màu động**: Khi bác sĩ nhập huyết áp 220 mmHg (cơn tăng huyết áp cấp cứu) hoặc SpO2 85%, giao diện không đổi màu cảnh báo đỏ để nhắc nhở bác sĩ chú ý.
  5. **Chưa có debounce tìm kiếm hàng đợi sidebar**: Khi gõ vào ô tìm kiếm bệnh nhân ở sidebar, hàm filter chạy liên tục trên từng phím bấm.

---

### 2.4. Modal Tra cứu Mã bệnh ICD-10 (`ICDModal.tsx`)
* **File nguồn**: [`shared/components/ICDModal.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/shared/components/ICDModal.tsx).
* **Lỗ hổng tương tác nghiêm trọng**:
  1. **Nút bấm Demo nổi lơ lửng trên màn hình**: Tại dòng 36-42, có một nút bấm `<button className="btn" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 50 }}>` ghi chữ `Tra cứu ICD (demo)`. Nút này hiển thị thường trực ở mọi trang và che khuất nội dung bên dưới.
  2. **Dữ liệu Mock tĩnh vỏn vẹn 3 mã bệnh**: Biến `mockICDs` chỉ có `J06.9`, `R06.0`, `J18.9`.
  3. **Không liên kết với Form khám bệnh**: Bấm chọn một mã bệnh chỉ hiển thị `alert("Chọn ICD...")` chứ không truyền ngược lại mã bệnh vào ô chẩn đoán của bệnh án.

---

### 2.5. Phân hệ Hồ sơ Bệnh án Lịch sử (`/records`)
* **File nguồn**: [`records/components/RecordsPanel.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/records/components/RecordsPanel.tsx).
* **Lỗ hổng tương tác**:
  1. **100% Mock Data tĩnh**: Toàn bộ danh sách 5 bệnh nhân và các tab hồ sơ đều là dữ liệu giả lập.
  2. **Các nút tác vụ chính vô tác dụng**: Nút "Lịch sử", "In bệnh án", "Xuất hồ sơ" là các thẻ HTML button tĩnh, không có handler `onClick`.
  3. **Không có phân trang danh sách bệnh án**: Nếu bệnh viện có 10.000 hồ sơ bệnh án cũ, thanh cuộn sidebar sẽ bị quá tải bộ nhớ.

---

### 2.6. Phân hệ Tra cứu Danh mục (`/catalog`)
* **File nguồn**: [`catalog/components/CatalogPanel.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/catalog/components/CatalogPanel.tsx).
* **Lỗ hổng tương tác**:
  1. **Dữ liệu Hardcode thô**: 6 tab (ICD, DVKT, Thuốc, Vật tư, Dị ứng, Tiền sử) được khai báo trực tiếp trong file JavaScript bằng mảng mảng 2 chiều `['J06.9', 'Nhiễm trùng...', ...]`.
  2. **Chỉ là bảng tĩnh chỉ đọc**: Không có bộ lọc chuyên sâu theo nhóm dược lý hay nhóm kỹ thuật.

---

### 2.7. Phân hệ Báo cáo & Cấu hình Hệ thống (`/reports`, `/system`)
* **File nguồn**: [`reports/pages/ReportsPage.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/reports/pages/ReportsPage.tsx), [`system/routes.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/system/routes.tsx).
* **Lỗ hổng tương tác**:
  1. **Import nhầm Component giữa các module**: Tại [`system/routes.tsx`](file:///Users/jtuong/Documents/ClinicManagement/ClinicManagement.DoctorUI/src/system/routes.tsx#L2), route `/system` đang import file `ReportsPage.tsx`.
  2. **Trang trống rỗng hoàn toàn**: Cả 2 trang chỉ render một icon công trường và dòng chữ "Đang phát triển".

---

### 2.8. Tổng hợp Giải pháp Cải tiến Kỹ thuật Toàn diện

```
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| HẠNG MỤC CẢI TIẾN         | HIỆN TRẠNG YẾU KÉM                                   | GIẢI PHÁP KỸ THUẬT ĐỀ XUẤT                              |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| Hệ thống Thông báo        | alert(), confirm() làm đứng luồng trình duyệt        | Thay bằng react-hot-toast (đã có sẵn trong package.json) |
|                           |                                                      | hoặc custom Toast/Notification theo palette #0b4f6c      |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| Xác nhận Thao tác Nguy cơ | Bấm hủy khám/hoàn tất khám thực hiện ngay lập tức    | Xây dựng component ConfirmModal chuyên dụng             |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| Trạng thái Tải dữ liệu    | Chớp màn hình hoặc đơ khi tải dữ liệu                | Bổ sung Skeleton loader mô phỏng cấu trúc form           |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| Phòng ngừa Mất dữ liệu    | Đổi bệnh nhân làm mất toàn bộ form đang gõ dở         | Hook useUnsavedChangesWarning kích hoạt confirm dialog   |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| Điều hướng & Routing      | Lệch path giữa /overview và /dashboard               | Chuẩn hóa URL, cập nhật NavLink và breadcrumbs           |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| Tối ưu hóa Hiệu năng      | Tải cứng 1000 bệnh nhân trong hàng đợi               | Áp dụng phân trang Server-side + Debounce search 300ms   |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
| Dọn dẹp Kiến trúc mã      | Trùng lặp ActionToolbar ở 2 thư mục                  | Gom về src/shared/components/ActionToolbar.tsx duy nhất  |
+---------------------------+------------------------------------------------------+----------------------------------------------------------+
```

---

# 3. Bảng Kiểm Tra Mock Data & Kế Hoạch Thay Thế Bằng API Thật (Audit Checklist)

Bảng rà soát toàn bộ các vị trí đang dùng dữ liệu mock trong mã nguồn `ClinicManagement.DoctorUI` và ánh xạ trực tiếp sang các Endpoint API tương ứng:

| Màn hình / Component | File Path & Biến / Hàm Mock | Chi tiết API cần thay thế (Method + Endpoint đề xuất) | Cấu trúc Payload / Response mong đợi | Độ ưu tiên |
| :--- | :--- | :--- | :--- | :---: |
| **Tổng quan / Dashboard** | `src/dashboard/components/OverviewPanel.tsx`<br>`const mockData` (Dòng 5-46) | `GET /api/LuotKham/thong-ke-bac-si`<br>*(Lấy KPI tổng, chờ, đang khám, hoàn thành)* | **Response**:<br>`{ success: true, data: { totalPatients: 18, waiting: 6, examining: 1, completed: 10, pending: 4, cancelled: 1 } }` | **HIGH** |
| **Tổng quan / Dashboard** | `src/dashboard/components/OverviewPanel.tsx`<br>`mockData.appointments`<br>`mockData.tasks` | `GET /api/LichHen/bac-si-today`<br>`GET /api/LuotKham/canh-bao-lam-sang` | **Response**:<br>`{ success: true, data: { appointments: [...], alerts: [...] } }` | **MEDIUM** |
| **Hàng đợi khám bệnh** | `src/examination/hooks/useExam.ts`<br>`fetchQueue(1)` (Dòng 144 cứng ID bác sĩ) | `GET /api/LuotKham/hang-doi?maBacSi={user.id}` | Lấy `user.id` động từ `useAuth()` thay vì truyền số `1` cố định | **HIGH** |
| **Hàng đợi khám bệnh** | `src/queue/components/QueuePanel.tsx`<br>`ALL_QUEUE_PAGE_SIZE = 1000` (Dòng 24) | `GET /api/LuotKham/hang-doi?pageIndex=1&pageSize=20` | Phân trang Server-side, trả về `PagedResult<HangDoiDto>` | **HIGH** |
| **Tra cứu Mã bệnh ICD** | `src/shared/components/ICDModal.tsx`<br>`const mockICDs` (Dòng 10-14) | `GET /api/LuotKham/icd?keyword={kw}` | **Response**:<br>`{ success: true, data: [{ id: 1, maIcd: 'J06.9', tenIcd: 'Nhiễm trùng đường hô hấp...', moTa: '...' }] }` | **HIGH** |
| **Xử trí / Đơn thuốc** | `src/examination/components/workspaces/TreatmentWorkspace.tsx`<br>Tab kê đơn thuốc (mock mảng tĩnh) | `GET /api/Thuoc/danh-muc`<br>`POST /api/LuotKham/{id}/don-thuoc` | **Payload**:<br>`{ luotKhamId: 10, chiTiet: [{ maThuoc: 101, soLuong: 20, lieuDung: 'Uống 2 viên/ngày' }] }` | **HIGH** |
| **Bệnh án điện tử** | `src/examination/components/workspaces/ElectronicRecordWorkspace.tsx`<br>`data.examination`, `data.treatment.drugs` | `GET /api/LuotKham/{id}/summary`<br>`POST /api/LuotKham/{id}/finish-exam` | **Response Summary**:<br>`{ success: true, data: { patient: {...}, vitals: {...}, diagnoses: [...], drugs: [...], services: [...] } }` | **HIGH** |
| **Xử lý lưu / Hoàn tất** | `src/examination/hooks/useExam.ts`<br>`handleSave`, `handleFinish` (Dòng 133-141 dùng `alert`) | `POST /api/LuotKham/{id}/examination`<br>`POST /api/LuotKham/{id}/finish-exam` | Gửi request cập nhật database thay vì hiện hộp thoại `alert` tĩnh | **HIGH** |
| **Hồ sơ bệnh án** | `src/records/components/RecordsPanel.tsx`<br>`const mockRecords` (Dòng 5-11) | `GET /api/BenhNhan/paged?pageIndex=1&pageSize=20`<br>`GET /api/BenhNhan/{id}/profile` | **Response**:<br>`PagedResult<BenhNhanProfileDto>` kết hợp hồ sơ lịch sử khám bệnh cũ | **MEDIUM** |
| **Tra cứu Danh mục** | `src/catalog/components/CatalogPanel.tsx`<br>`const catalogData` (Dòng 5-54) | `GET /api/LuotKham/danh-muc-dich-vu`<br>`GET /api/LuotKham/icd`<br>`GET /api/Thuoc/catalog` | Nạp trực tiếp từ cơ sở dữ liệu danh mục của bệnh viện | **MEDIUM** |
| **Thanh ngữ cảnh ca trực** | `src/shared/components/ContextBar.tsx`<br>Hardcode ngày `27/08/2026`, ca `Sáng` (Dòng 29-31) | `GET /api/LichLamViec/ca-truc-hien-tai` | Lấy theo thời gian thực hệ thống và lịch làm việc thực tế của bác sĩ | **LOW** |
| **Thanh điều hướng Header** | `src/shared/components/Header.tsx`<br>Hardcode `BS. Nguyễn Văn Tuấn`, avatar `NT` | Lấy từ `useAuth().user` | Hiển thị Họ tên và Chức danh thực tế của tài khoản đang đăng nhập | **LOW** |

---

## 4. Kết Luận & Khuyến Nghị Lộ Trình Triển Khai
1. **Giai đoạn 1 (Khẩn cấp - High Priority)**:
   - Thay thế toàn bộ hộp thoại `alert()` và `window.confirm()` bằng `react-hot-toast` và Modal xác nhận.
   - Sửa lỗi điều hướng active tab `/overview` vs `/dashboard`.
   - Nối API lưu đơn thuốc và hoàn tất lượt khám tại `ElectronicRecordWorkspace`.
2. **Giai đoạn 2 (Tối ưu hóa - Medium Priority)**:
   - Thay thế mock data của màn hình Dashboard và Hồ sơ bệnh án bằng các API tổng hợp.
   - Bổ sung Skeleton loading và validation khoảng sinh học cho các chỉ số sinh hiệu.
   - Thêm cảnh báo người dùng khi thoát màn hình có dữ liệu chưa lưu (`useUnsavedChangesWarning`).
3. **Giai đoạn 3 (Hoàn thiện - Low Priority)**:
   - Kết nối dữ liệu động cho thanh `ContextBar` (Ca trực, phòng khám, thời gian thực).
   - Thiết kế trang `SystemPage.tsx` độc lập thay thế component mượn tạm từ `ReportsPage`.
