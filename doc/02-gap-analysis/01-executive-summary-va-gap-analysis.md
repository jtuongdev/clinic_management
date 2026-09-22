# GAP ANALYSIS – ADMIN UI vs. BÁO CÁO TECHNICAL LEAD HIS

> **Tác giả phân tích:** Lead BA / Technical Lead  
> **Ngày lập:** 2026-09-16  
> **Phiên bản:** 1.0.0  
> **Phạm vi:** Đánh giá khoảng cách giữa thiết kế UI Admin hiện tại (`ClinicManagement.AdminUI`) và yêu cầu vận hành từ bộ tài liệu kỹ thuật `bao-cao-technical-lead-his` (7 file + 6 flow nghiệp vụ).

---

## 1. TỔNG KẾT NHANH (EXECUTIVE SUMMARY)

### 1.1. Tỷ lệ đáp ứng tổng thể

| Góc nhìn đánh giá | Tỷ lệ đáp ứng |
|---|:---:|
| Màn hình CRUD nghiệp vụ cơ bản (BN, Kho, Nhân sự, Billing cơ bản) | **~65%** |
| Yêu cầu quản trị hệ thống HIS đầy đủ (IAM, Danh mục, Cấu hình, Audit) | **~30%** |
| Luồng nghiệp vụ khép kín đầu-cuối (Flow 01 → 06) | **~35%** |
| **Đáp ứng tổng thể so với báo cáo Technical Lead** | **~33%** |

> **Nhận định:** AdminUI hiện tại đã xây dựng tốt phần **back-office nghiệp vụ trung tâm** (bệnh nhân, kho, nhân sự, billing hóa đơn). Tuy nhiên, toàn bộ nhóm **Quản trị hệ thống (System Admin)** — bao gồm IAM/RBAC, danh mục gốc, cấu hình tích hợp, giám sát & audit — gần như chưa được triển khai dù đã khai báo trong menu. Đây là điểm rủi ro nghiêm trọng nhất.

### 1.2. Phân loại tổng quan theo module

| Module | Số yêu cầu TL | Đã đáp ứng | Còn thiếu | % Coverage |
|---|:---:|:---:|:---:|:---:|
| Auth / IAM / RBAC | 12 | 3 | 9 | 25% |
| Master Data Management | 14 | 4 | 10 | 29% |
| Cấu hình & Tích hợp | 10 | 0 | 10 | **0%** |
| Giám sát & Audit Trail | 8 | 0 | 8 | **0%** |
| Tiếp đón & Triage (Flow-01) | 8 | 3 | 5 | 38% |
| Khám bệnh & EMR (Flow-02) | 8 | 4 | 4 | 50% |
| Cận lâm sàng - CLS (Flow-03) | 8 | 2 | 6 | 25% |
| Kê đơn & Kho dược (Flow-04) | 10 | 6 | 4 | 60% |
| Viện phí & Thanh toán (Flow-05) | 12 | 5 | 7 | 42% |
| AI Integration (Flow-06) | 6 | 0 | 6 | **0%** |
| Báo cáo / BI | 8 | 1 | 7 | 13% |
| Nội trú / Giường bệnh | 6 | 0 | 6 | **0%** |
| **TỔNG** | **110** | **28** | **82** | **~25%** |

---

## 2. BẢNG GAP ANALYSIS CHI TIẾT

**Chú thích trạng thái:**
- ✅ **ĐẠT** — Đã có màn hình, trường dữ liệu và luồng thao tác đầy đủ
- ⚠️ **THIẾU** — Đã có màn hình nhưng thiếu trường/thao tác y tế cốt lõi
- ❌ **CHƯA CÓ** — Chưa thiết kế, hoàn toàn không có trong AdminUI

---

### NHÓM A: Quản trị Định danh & Bảo mật (IAM / RBAC)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| A1 | CRUD Vai trò (Role): tạo, sửa, xóa, xem chi tiết từng role (Doctor, Nurse, Pharmacist, Cashier, Admin IT) | Có modal gán role trong EmployeeManagement nhưng không có màn hình CRUD Role độc lập | ⚠️ THIẾU | Không thể tạo/sửa/xóa role khi mở rộng |
| A2 | Ma trận phân quyền (Permission Matrix): hiển thị và chỉnh sửa permission theo module/action cho từng role | Modal xem permissions trong EmployeeManagement nhưng chỉ xem, chưa chỉnh sửa được | ⚠️ THIẾU | Admin không kiểm soát quyền khi thêm module mới |
| A3 | Phân quyền dữ liệu theo Cơ sở / Khoa / Phòng (Data Scope) | Chưa có màn hình nào cấu hình data scope | ❌ CHƯA CÓ | Bác sĩ Khoa A xem được dữ liệu Khoa B — vi phạm bảo mật y tế |
| A4 | Quản lý tài khoản: kích hoạt/khoá/mở khoá tài khoản nhân viên | Có chức năng khóa/mở khóa trong EmployeeManagement | ✅ ĐẠT | — |
| A5 | Reset mật khẩu / đổi mật khẩu cưỡng bức cho nhân viên | Chưa có | ❌ CHƯA CÓ | Không xử lý khi nhân viên nghỉ việc hoặc lộ tài khoản |
| A6 | Policy phân vai trò: DoctorClinicalWrite, PharmacyDispense, CashierPayment, SystemAdmin | ProtectedRoute chỉ bọc chung roles=['Admin'], chưa phân policy theo vai trò | ❌ CHƯA CÓ | Thu ngân truy cập được màn hình EMR; bác sĩ vào payroll |
| A7 | Audit log truy cập tài khoản: đăng nhập/đăng xuất, đổi quyền, reset mật khẩu | Không có màn hình audit log tài khoản | ❌ CHƯA CÓ | Không truy vết được xâm nhập tài khoản |
| A8 | Cấu hình session timeout, rate limit đăng nhập | Không có màn hình cấu hình | ❌ CHƯA CÓ | Rủi ro brute-force tài khoản admin |
| A9 | Gán nhân viên vào Cơ sở / Khoa / Phòng khám tập trung | Có trong form nhân viên (Cơ sở, Khoa) nhưng thiếu UI quản lý tập trung | ⚠️ THIẾU | Không xem được cấu hình nhân sự theo cơ sở dạng tổng quan |
| A10 | Danh sách phiên đăng nhập đang hoạt động (Active Sessions) | Chưa có | ❌ CHƯA CÓ | Không thu hồi được session khi phát hiện bất thường |
| A11 | Logout revoke token phía server | Backend chưa hỗ trợ; UI cũng chưa có xử lý | ❌ CHƯA CÓ | Token bị dùng lại sau khi đăng xuất |
| A12 | Quản lý tài khoản bệnh nhân (Patient Account): trạng thái, kích hoạt, lịch sử đăng nhập | Có tab Account trong PatientDetail (chỉ xem trạng thái) | ⚠️ THIẾU | Không quản lý được tài khoản app bệnh nhân |

---

### NHÓM B: Quản trị Danh mục Dùng chung (Master Data Management)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| B1 | CRUD Cơ sở y tế: tên, địa chỉ, mã cơ sở, trạng thái hoạt động | Module `facility` chỉ có hook dropdown, không có màn hình CRUD | ❌ CHƯA CÓ | Không thêm/sửa cơ sở khi mở rộng hệ thống |
| B2 | CRUD Khoa / Phòng: mã, tên, loại, cơ sở cha, trạng thái | Module `department` chỉ có hook, không có màn hình CRUD | ❌ CHƯA CÓ | Không thêm khoa mới, không cập nhật thông tin khoa |
| B3 | CRUD Phòng khám: số phòng, thiết bị, bác sĩ phụ trách | Module `clinic` chỉ có hook, không có màn hình CRUD | ❌ CHƯA CÓ | Không cấu hình được phòng khám mới |
| B4 | Danh mục ICD-10: tìm kiếm, cập nhật batch, đánh dấu active/inactive | Không có màn hình admin ICD-10; chỉ có tìm kiếm trong DoctorUI | ❌ CHƯA CÓ | Không đồng bộ được khi Bộ Y tế cập nhật ICD |
| B5 | Danh mục dịch vụ kỹ thuật CLS: mã dịch vụ, loại (XN/CĐHA/thăm dò), đơn vị, giá | Không có màn hình riêng; chỉ dropdown trong ExaminationCLS | ❌ CHƯA CÓ | Không thêm/sửa được dịch vụ CLS; giá dịch vụ sai |
| B6 | Danh mục thuốc nâng cao: **số đăng ký, hoạt chất, mã ánh xạ BHYT**, hàm lượng, dạng bào chế, nhóm dược lý | ItemCatalogPage thiếu toàn bộ trường y tế cốt lõi này | ⚠️ THIẾU | AI kiểm tra tương tác thất bại; sai mã BHYT |
| B7 | Danh mục vật tư y tế: phân biệt rõ với thuốc, hạn dùng mặc định, nhóm, cấp phát theo chỉ định | ItemCatalogPage không phân loại đúng chuẩn HIS | ⚠️ THIẾU | Báo cáo kho, BHYT bị sai phân loại |
| B8 | Bảng giá viện phí: theo từng dịch vụ, có hiệu lực effectiveFrom/To, version | Không có màn hình quản lý bảng giá | ❌ CHƯA CÓ | Tính tiền viện phí sai khi có đợt điều chỉnh giá |
| B9 | Bảng giá BHYT: mức chi trả, nhóm đối tượng, dịch vụ được bao phủ | Không có màn hình | ❌ CHƯA CÓ | Áp dụng BHYT thủ công, dễ sai, không đối soát được |
| B10 | Danh mục nhà cung cấp với đầy đủ thông tin pháp lý | SupplierPage đã có (Mã NCC, Tên, MST, SĐT, Địa chỉ, Công nợ) | ✅ ĐẠT | — |
| B11 | Cấu hình loại ca trực: thêm/sửa mã ca, giờ bắt đầu/kết thúc, hệ số lương | Có màn hình schedule nhưng thiếu màn hình cấu hình loại ca | ⚠️ THIẾU | Ca trực không linh hoạt; không thêm loại ca trực mới |
| B12 | Danh mục bảo hiểm / hình thức thanh toán | Không có màn hình cấu hình | ❌ CHƯA CÓ | Không thêm được hình thức bảo hiểm doanh nghiệp mới |
| B13 | Danh mục loại tiền sử bệnh (Medical History Types) | Backend có API; AdminUI chưa có màn hình CRUD | ❌ CHƯA CÓ | Không mở rộng được danh mục tiền sử |
| B14 | Nhập danh mục từ Excel/CSV (Import Batch) | Không có tính năng | ❌ CHƯA CÓ | Mất nhiều thời gian nhập liệu ban đầu khi go-live |

---

### NHÓM C: Cấu hình & Tích hợp Hệ thống

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| C1 | Cấu hình kết nối LIS: URL, credentials, mapping xét nghiệm | Chưa có màn hình | ❌ CHƯA CÓ | Không tích hợp được máy xét nghiệm |
| C2 | Cấu hình kết nối PACS/RIS: URL server, viewer integration | Chưa có màn hình | ❌ CHƯA CÓ | Không xem được DICOM/X-quang trong HIS |
| C3 | Cấu hình cổng BHXH / Bộ Y tế: endpoint, API key, certificate | Chưa có màn hình | ❌ CHƯA CÓ | Không liên thông được với cổng quốc gia |
| C4 | Quản lý API Keys / Webhook: tạo, thu hồi, xem log gọi API | Chưa có màn hình | ❌ CHƯA CÓ | Không kiểm soát được bên thứ ba tích hợp |
| C5 | Cấu hình máy in phiếu khám / tem nhãn thuốc: chọn máy in, khổ giấy, template | Chưa có màn hình | ❌ CHƯA CÓ | Nhân viên không in được phiếu/nhãn đúng khổ |
| C6 | Cấu hình thông số hệ thống: timezone, ngôn ngữ, định dạng ngày giờ, số thứ tự | Chưa có màn hình | ❌ CHƯA CÓ | Số thứ tự sai ngày; timezone lệch làm sai audit timestamp |
| C7 | Cấu hình giới hạn lượt khám / ngày theo khoa (Daily Quota) | Chưa có màn hình | ❌ CHƯA CÓ | Phòng khám quá tải không được kiểm soát |
| C8 | Cấu hình AI Service: endpoint, timeout, ngưỡng confidence tối thiểu | Chưa có màn hình | ❌ CHƯA CÓ | Không tắt/bật AI, không điều chỉnh threshold |
| C9 | Cấu hình thông báo: email SMTP, webhook Zalo/Telegram OA bệnh viện | Chưa có màn hình | ❌ CHƯA CÓ | Nhân viên không nhận cảnh báo kết quả CLS bất thường |
| C10 | Quản lý phiên bản / Release notes | Chưa có màn hình | ❌ CHƯA CÓ | Khó theo dõi thay đổi hệ thống khi vận hành |

---

### NHÓM D: Giám sát Hệ thống & Kiểm toán (Monitoring & Audit Log)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| D1 | Nhật ký truy cập bệnh án (EMR Audit Trail): ai xem/sửa hồ sơ, lúc nào, IP, trước/sau | Chưa có màn hình. Settings/logs chỉ là placeholder | ❌ CHƯA CÓ | Vi phạm quy định bảo mật dữ liệu y tế (Thông tư 46/2018) |
| D2 | Log giao dịch viện phí: ai tạo/hủy/hoàn tiền hóa đơn, lý do | Chưa có màn hình audit billing | ❌ CHƯA CÓ | Không truy được tiêu cực tài chính |
| D3 | Log giao dịch kho: xuất/nhập/trả/hủy, theo lô, theo người dùng | Backend có `/api/inventory/audit-transactions`; AdminUI chưa có màn hình | ❌ CHƯA CÓ | Không kiểm tra được mất mát tồn kho |
| D4 | Giám sát dịch vụ nền (Background Jobs/Queue): Reservation hết hạn, cron jobs | Chưa có màn hình. Dashboard chỉ hiển thị KPI nghiệp vụ | ❌ CHƯA CÓ | Cron job dừng -> kho bị giữ tồn ảo; đơn thuốc không được xử lý |
| D5 | Health Check Dashboard: trạng thái API, DB, Redis, Queue, AI Service | Chưa có màn hình | ❌ CHƯA CÓ | Không phát hiện sự cố hệ thống kịp thời |
| D6 | Giám sát real-time: số request/giây, latency p95, lỗi 5xx | Chưa có màn hình | ❌ CHƯA CÓ | Không phát hiện bottleneck giờ cao điểm |
| D7 | Log đăng nhập thất bại / brute-force detection | Chưa có màn hình | ❌ CHƯA CÓ | Không phát hiện kịp thời tấn công tài khoản |
| D8 | Xuất báo cáo audit ra CSV/Excel theo yêu cầu thanh tra | Chưa có | ❌ CHƯA CÓ | Không đáp ứng yêu cầu thanh tra Bộ Y tế |

---

### NHÓM E: Luồng Tiếp đón & Phân luồng (Flow-01)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| E1 | Reception Workstation: tìm BN theo CCCD/SĐT, xem lịch hẹn hôm nay, tạo lượt khám chuẩn `POST /api/reception/visits` | AddPatientForm làm cả 2 nhiệm vụ (tạo BN + tạo lượt). Chưa phân tách thành workstation tiếp đón riêng | ⚠️ THIẾU | Điều dưỡng dùng màn hình admin tổng quát, không tối ưu luồng |
| E2 | Appointment Management: danh sách, tạo mới, xác nhận, hủy, xem theo bác sĩ/ngày | Menu khai báo `/appointment` nhưng hoàn toàn chưa có màn hình | ❌ CHƯA CÓ | Không có cơ chế đặt lịch trước |
| E3 | Triage form: nhập sinh hiệu nhanh (huyết áp, SpO2, nhiệt độ, nhịp tim), chọn priority (NORMAL/URGENT/EMERGENCY) | ExaminationPatients có danh sách hàng đợi nhưng chưa có form triage với đủ trường sinh hiệu và priority | ⚠️ THIẾU | Không phân loại được ca cấp cứu; trì hoãn xử lý khẩn cấp |
| E4 | Hàng đợi real-time: số thứ tự, tên BN, thời gian chờ ước tính, phòng chờ | ExaminationPatients có danh sách nhưng thiếu thời gian chờ ước tính và cập nhật real-time | ⚠️ THIẾU | Bệnh nhân chờ lâu không biết đến số mình |
| E5 | Queue Overview toàn cơ sở: giám sát đa khoa đồng thời | ExaminationOverview có thống kê theo khoa nhưng chưa đủ chi tiết | ⚠️ THIẾU | Điều phối viên không tổng quan được toàn cơ sở |
| E6 | Chuyển khoa / Chuyển phòng: form ghi lý do, chọn khoa đích, lịch sử chuyển | Chưa có màn hình | ❌ CHƯA CÓ | Không theo dõi được bệnh nhân khi chuyển khoa |
| E7 | Hủy lượt có ghi lý do (Cancel with reason) | Có nút Hủy trong ActionBar nhưng chưa có form nhập lý do hủy | ⚠️ THIẾU | Audit không ghi được lý do hủy; không phân tích tỷ lệ bỏ khám |
| E8 | State machine visualization: hiển thị trạng thái và chuyển đúng quy trình, validate trên UI | ActionBar có 4 action nhưng chưa validate state machine | ⚠️ THIẾU | Có thể chuyển trạng thái sai, gây lỗi backend |

---

### NHÓM F: Khám bệnh & EMR (Flow-02)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| F1 | Doctor Workstation: nhập sinh hiệu, tiền sử, chẩn đoán ICD, kê đơn | Thuộc DoctorUI (riêng biệt) — không phải nhiệm vụ AdminUI | ✅ ĐẠT (DoctorUI) | — |
| F2 | EMR Audit Trail viewer cho Admin/Quản lý: ai sửa hồ sơ, lúc nào, trước/sau | Chưa có trong AdminUI | ❌ CHƯA CÓ | Vi phạm Thông tư 46/2018/TT-BYT về kiểm toán bệnh án |
| F3 | Màn hình mở khóa EMR đặc biệt: Admin/MEDICAL_RECORD_MANAGER mở khóa tạm với lý do bắt buộc | Chưa có màn hình | ❌ CHƯA CÓ | Không xử lý được tình huống sai sót cần chỉnh sửa hợp lệ |
| F4 | Dashboard thống kê khám: số ca theo bác sĩ, khoa, giờ, tỷ lệ AI suggest | ExaminationReports có cơ bản nhưng chi tiết chưa đủ | ⚠️ THIẾU | Ban quản lý không theo dõi được năng suất lâm sàng |
| F5 | Quản lý danh mục ICD-10 (Admin): đồng bộ, thêm/sửa, active/inactive | Chưa có màn hình | ❌ CHƯA CÓ | Danh mục ICD lỗi thời, bác sĩ không tìm được mã mới |
| F6 | AI Suggestion log: xem lịch sử requestId, tỷ lệ chấp nhận, feedback bác sĩ | Chưa có màn hình | ❌ CHƯA CÓ | Không đánh giá được chất lượng mô hình AI |
| F7 | Kết quả CLS trong EMR (for Admin): xem kết quả đã duyệt, normalRange, interpretation, file đính kèm | PatientDetail Labs Tab có nhưng thiếu trường normalRange, interpretation, bác sĩ duyệt | ⚠️ THIẾU | Admin xem được nhưng thiếu context lâm sàng |
| F8 | Tìm kiếm toàn văn EMR (Full-text search across records) | Chưa có | ❌ CHƯA CÓ | Không tra cứu được hồ sơ theo triệu chứng/chẩn đoán |

---

### NHÓM G: Cận lâm sàng – CLS (Flow-03)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| G1 | KTV Workstation: danh sách chỉ định chờ tiếp nhận, bấm Tiếp nhận mẫu | ExaminationCLS là góc nhìn giám sát, không phải workstation KTV | ⚠️ THIẾU | KTV không có màn hình nghiệp vụ; phải dùng hệ thống khác |
| G2 | Form Tiếp nhận mẫu: số mẫu, máy thực hiện, ghi chú tiếp nhận | Chưa có form | ❌ CHƯA CÓ | Không ghi nhận thời điểm tiếp nhận; không tính được SLA |
| G3 | Form Nhập kết quả: resultText, normalRange, đơn vị, interpretation, upload file PDF/DICOM | Chưa có form | ❌ CHƯA CÓ | KTV không nhập được kết quả; luồng CLS bị đứt |
| G4 | Upload file kết quả: PDF, DICOM, JPEG (tối đa 50MB/file) | Chưa có | ❌ CHƯA CÓ | Không lưu được kết quả hình ảnh vào hồ sơ |
| G5 | Màn hình duyệt kết quả CLS: bác sĩ CLS xem và phê duyệt, hoặc yêu cầu làm lại | Chưa có màn hình duyệt kết quả trong AdminUI | ❌ CHƯA CÓ | Kết quả chưa phê duyệt vẫn có thể hiển thị trong EMR |
| G6 | Alert kết quả bất thường (BAT_THUONG): notification real-time đến bác sĩ chỉ định | ExaminationCLS có thống kê nhưng chưa có cơ chế alert real-time | ⚠️ THIẾU | Bác sĩ không hay biết kết quả nguy kịch; nguy hiểm tính mạng |
| G7 | CRUD danh mục dịch vụ CLS: thêm/sửa, gắn giá theo bảng giá hiệu lực | Không có màn hình admin danh mục CLS | ❌ CHƯA CÓ | Không thêm được loại xét nghiệm mới |
| G8 | Báo cáo CLS: tỷ lệ hoàn thành, thời gian TAT, tỷ lệ bất thường theo loại dịch vụ | ExaminationReports có cơ bản nhưng thiếu TAT và phân loại | ⚠️ THIẾU | Không đánh giá được chất lượng dịch vụ CLS |

---

### NHÓM H: Kê đơn & Kho dược (Flow-04)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| H1 | Cấp phát thuốc theo đơn bác sĩ: tab đơn chờ, chọn lô FEFO, in đơn | Đã có DispensePage với tab Cấp theo đơn và Đã cấp phát | ✅ ĐẠT | — |
| H2 | Xuất bán lẻ tại quầy thuốc (không kê đơn) | Đã có tab Bán lẻ trong DispensePage | ✅ ĐẠT | — |
| H3 | Nhập kho từ nhà cung cấp: số lô, hạn dùng, giá nhập, duyệt nhập | Đã có ImportPage | ✅ ĐẠT | — |
| H4 | Tồn kho theo lô (Lot): số lô, hạn dùng, cảnh báo sắp hết hạn | Đã có StockPage với AlertBadges | ✅ ĐẠT | — |
| H5 | Kiểm kê kho: tạo phiếu, ghi số đếm thực tế, chốt chênh lệch | Đã có StocktakePage | ✅ ĐẠT | — |
| H6 | Danh mục thuốc nâng cao: **số đăng ký, hoạt chất, mã ATC, mã ánh xạ BHYT**, nhóm dược lý | ItemCatalogPage thiếu toàn bộ trường y tế cốt lõi | ⚠️ THIẾU | AI kiểm tra tương tác không hoạt động; sai mã BHYT |
| H7 | Quản lý Reservation tồn kho: hiển thị danh sách reservation đang hoạt động, hết hạn | Chưa có màn hình quản lý reservation | ❌ CHƯA CÓ | Không giám sát được tồn kho bị giữ ảo |
| H8 | Điều chuyển kho (Transfer): form tạo phiếu điều chuyển giữa các kho | Chưa có | ❌ CHƯA CÓ | Không điều phối thuốc khi một kho hết |
| H9 | Quản lý lô hết hạn: danh sách tập trung, thao tác xử lý (hủy/trả NCC) | StockPage có badge cảnh báo nhưng chưa có màn hình quản lý hết hạn tập trung | ⚠️ THIẾU | Thuốc hết hạn không được xử lý kịp thời |
| H10 | Audit giao dịch kho: ai xuất/nhập/hủy, lúc nào, lô nào, số lượng | Backend có API; AdminUI chưa có màn hình | ❌ CHƯA CÓ | Không kiểm soát được mất mát tồn kho |

---

### NHÓM I: Viện phí & Thanh toán (Flow-05)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| I1 | Danh sách hóa đơn với filter trạng thái, bộ lọc ngày | Đã có InvoiceListPage + InvoiceTable đầy đủ | ✅ ĐẠT | — |
| I2 | Ghi nhận thanh toán (nhiều lần, nhiều phương thức) | Đã có RecordPaymentModal | ✅ ĐẠT | — |
| I3 | Áp dụng BHYT: nhập số thẻ, mức chi trả | Đã có ApplyInsuranceModal | ✅ ĐẠT | — |
| I4 | Hủy hóa đơn với lý do | Đã có CancelInvoiceModal | ✅ ĐẠT | — |
| I5 | Quản lý công nợ bệnh nhân | Đã có DebtManagementPage + DebtsTable | ✅ ĐẠT | — |
| I6 | Mở/Đóng ca thu ngân (Cashier Session): mở ca với số tiền đầu ca, đóng ca với thực thu | Chưa có màn hình quản lý ca thu ngân | ❌ CHƯA CÓ | Không đối soát được tiền mặt theo ca; dễ thất thoát |
| I7 | Hủy phiếu thu (Void Payment): hủy thanh toán đã ghi trong ngày, cần lý do và người duyệt | Chưa có chức năng void phiếu thu | ❌ CHƯA CÓ | Không xử lý được sai sót thu tiền |
| I8 | Hoàn tiền (Refund): tạo RefundRecord riêng, không sửa hóa đơn gốc | Chưa có màn hình hoàn tiền | ❌ CHƯA CÓ | Không trả tiền được cho bệnh nhân đúng quy trình |
| I9 | Chốt hóa đơn bất biến (Finalize): sinh số hóa đơn HD-YYYY-XXXXXX chuẩn | Chưa có nút/chức năng finalize | ❌ CHƯA CÓ | Hóa đơn có thể bị sửa sau khi đã in/giao cho BN |
| I10 | Kiểm tra BHYT eligibility: xác minh hạn thẻ, mức chi trả, copay theo dịch vụ | ApplyInsuranceModal chỉ nhập số và mức — chưa gọi API eligibility thực | ⚠️ THIẾU | Áp sai mức hưởng BHYT; rủi ro đối soát |
| I11 | Đối soát cuối ngày (Daily Reconciliation): Expected vs Actual theo cơ sở, ngày | Chưa có màn hình đối soát | ❌ CHƯA CÓ | Không phát hiện được chênh lệch tiền mặt cuối ngày |
| I12 | Báo cáo doanh thu: theo ngày/tuần/tháng, theo phương thức, theo bác sĩ/khoa | Menu khai báo `/finance-reports/revenue` nhưng chưa có màn hình | ❌ CHƯA CÓ | Ban giám đốc không có số liệu tài chính để ra quyết định |

---

### NHÓM J: AI Integration (Flow-06)

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| J1 | Dashboard AI: trạng thái Circuit Breaker (CLOSED/OPEN/HALF-OPEN), số request, tỷ lệ thành công | Chưa có màn hình | ❌ CHƯA CÓ | Admin không biết AI đang hoạt động hay đang serve degraded |
| J2 | Log gợi ý AI chẩn đoán: lịch sử requestId, input, output, tỷ lệ bác sĩ chấp nhận | Chưa có màn hình | ❌ CHƯA CÓ | Không đánh giá được chất lượng AI gợi ý |
| J3 | Log kiểm tra tương tác thuốc: cảnh báo CRITICAL đã được override với lý do | Chưa có màn hình | ❌ CHƯA CÓ | Không phát hiện bác sĩ bỏ qua cảnh báo CRITICAL nguy hiểm |
| J4 | Quản lý job phân tích EMR async: xem PENDING/DONE/FAILED, retry, xem kết quả | Chưa có màn hình | ❌ CHƯA CÓ | Job thất bại không ai hay biết |
| J5 | Feedback Dashboard: xem rating từ bác sĩ, tỷ lệ correct/incorrect theo model version | Chưa có màn hình | ❌ CHƯA CÓ | Không có dữ liệu fine-tune mô hình AI |
| J6 | Cấu hình AI: endpoint, timeout, model version, ngưỡng confidence | Chưa có màn hình | ❌ CHƯA CÓ | Không điều chỉnh được hành vi AI |

---

### NHÓM K: Nội trú & Giường bệnh

| # | Yêu cầu từ Báo cáo Tech Lead | Hiện trạng AdminUI | Đánh giá | Rủi ro nếu bỏ qua |
|---|---|---|:---:|---|
| K1 | Sơ đồ buồng/giường (Bed Map): tình trạng từng giường (Trống/Đang dùng/Bảo trì) | Menu khai báo `/inpatient/rooms` nhưng hoàn toàn chưa có màn hình | ❌ CHƯA CÓ | Không quản lý được giường nội trú |
| K2 | Nhận bệnh nhân nội trú (Admit): gán giường, khoa, bác sĩ điều trị | Chưa có | ❌ CHƯA CÓ | Không có luồng nhập viện trong hệ thống |
| K3 | Chuyển giường/chuyển khoa nội trú | Chưa có | ❌ CHƯA CÓ | Không theo dõi được bệnh nhân nội trú khi chuyển |
| K4 | Y lệnh (Medical Order): điều dưỡng nhận y lệnh, xác nhận thực hiện | Chưa có | ❌ CHƯA CÓ | Không số hóa được y lệnh điều dưỡng |
| K5 | Xuất viện (Discharge): tổng kết điều trị, lập hóa đơn xuất viện | Menu khai báo `/inpatient/discharge` nhưng chưa có màn hình | ❌ CHƯA CÓ | Không có luồng xuất viện chính thức |
| K6 | Báo cáo tỷ lệ sử dụng giường (Bed Occupancy Rate) | Chưa có | ❌ CHƯA CÓ | Không tối ưu được công suất giường bệnh |

---

*© 2026 – Tài liệu Gap Analysis nội bộ – ClinicManagement HIS*
