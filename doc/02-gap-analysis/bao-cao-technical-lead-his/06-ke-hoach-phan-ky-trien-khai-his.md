# Kế hoạch phân kỳ triển khai HIS/EMR theo chuẩn dự án

> Ghi chú: Nội dung dưới đây được xây dựng từ các tài liệu kỹ thuật hiện có trong thư mục `bao-cao-technical-lead-his` và dựa trên cấu trúc hiện trạng backend ASP.NET Core / EF Core / MediatR của dự án ClinicManagement. Trong môi trường hiện tại không có quyền trực tiếp ghi vào Google Docs, nên bản sao tương đương đã được lưu dưới dạng tài liệu Markdown trong repo để dễ review, chỉnh sửa và chuyển tiếp sang Google Docs khi cần.

## 1. Executive Summary

### 1.1. Mục tiêu dự án
Hệ thống HIS/EMR cần xây dựng nền tảng bệnh viện hiện đại với trải nghiệm đồng nhất từ tiếp đón, khám bệnh, điều trị, dược/kho, viện phí/BHYT đến báo cáo điều hành. Mục tiêu là:

- Tạo hệ thống quản lý bệnh nhân và lượt khám ổn định và có thể mở rộng.
- Đảm bảo luồng lâm sàng và nghiệp vụ tài chính đi liền với thông tin bệnh án.
- Có nền tảng tích hợp cận lâm sàng, thiết bị y tế và dữ liệu bảo hiểm quốc gia.
- Đạt mức sản phẩm đủ dùng cho pilot bệnh viện và sẵn sàng nâng cấp theo mô hình production.

### 1.2. Phạm vi thực hiện
Phạm vi hiện tại trong tài liệu đã xác định các phân hệ chính như sau:

- Kiến trúc và hạ tầng: API, database, bảo mật, logging, HA/DR.
- Core HIS: bệnh nhân, tiếp đón, khám bệnh, bệnh án điện tử, dược/kho, viện phí/BHYT.
- Tích hợp cận lâm sàng: LIS, RIS/PACS, cổng BHYT, cổng dữ liệu Bộ Y tế.
- Hạ tầng vận hành: backup, restore, migration dữ liệu, health check, monitor.

### 1.3. Tình trạng hiện tại
Theo báo cáo kỹ thuật, hệ thống đang ở mức nền tảng HIS ngoại trú khả thi cho demo/đồ án tốt nghiệp, khoảng 55% về độ hoàn thiện HIS tổng thể và khoảng 75% nếu giới hạn trong phạm vi ngoại trú. Đây là mức nền tảng tốt nhưng chưa đạt production readiness do các điểm thiếu như:

- Policy authorization và data scoping chưa đồng bộ.
- Transaction xuyên module chưa được xử lý chặt chẽ.
- Workflow CLS / BHYT / audit nghiệp vụ chưa đầy đủ.
- Thiếu global exception handling, traceId, observability và backup/DR.

### 1.4. Tóm tắt tiến độ đề xuất
Dự kiến triển khai theo 5 đợt với mục tiêu rõ ràng:

| Đợt | Tên đợt | Mục tiêu | Thời gian ước tính |
|---|---|---|---|
| Đợt 0 | Chuẩn bị & Hạ tầng | Hạ tầng, bảo mật, chuẩn dữ liệu | 2–4 tuần |
| Đợt 1 | Core HIS & Ngoại trú - Pilot | Tiếp đón, khám, viện phí ngoại trú, thuốc cơ bản | 4–6 tuần |
| Đợt 2 | Nội trú & Chuyên sâu | EMR nội trú, giường bệnh, phẫu thuật, dược lâm sàng | 4–6 tuần |
| Đợt 3 | Tích hợp cận lâm sàng & Thiết bị | LIS, PACS/RIS, BHYT, dashboard | 4–8 tuần |
| Đợt 4 | Nghiệm thu & Go-Live | Đào tạo, chạy song song, chuyển giao vận hành | 3–5 tuần |

---

## 2. Phân tích & bóc tách theo nhóm

### 2.1. Kiến trúc & Hạ tầng

| Hạng mục | Mô tả | Yêu cầu triển khai |
|---|---|---|
| Server & runtime | ASP.NET Core API, EF Core, MediatR, AdminUI React/Vite | Tách API, DB, UI, quản trị rõ ràng |
| Database | SQL Server chính, repository pattern, migration | Có chuẩn backup, index, partition nếu cần |
| Cloud/on-premise | Hệ thống y tế có thể chạy on-premise hoặc cloud hybrid | Cân nhắc HA tại dữ liệu lâm sàng |
| Bảo mật y tế | JWT, RBAC, policy, dữ liệu nhạy cảm | Mã hóa at rest, kiểm soát quyền theo cơ sở/khoa |
| Backup & DR | Khôi phục dữ liệu, snapshot, log backup | Bảo đảm RPO/RTO quy định bệnh viện |
| Observability | Logging, health check, structured logs | Monitoring, trace, alert |

#### Nền tảng kỹ thuật cần chuẩn hóa
- API Gateway / reverse proxy: NGINX, IIS hoặc Azure App Gateway tùy môi trường.
- Database: SQL Server 2019/2022 hoặc Azure SQL Managed Instance tùy quy mô.
- Identity: JWT + role policy + user session management.
- Secrets: Key Vault / Azure Key Vault / vault manager, không để trong `appsettings.json`.
- Backup: Full + differential + transaction log, retention tối thiểu 30–90 ngày.
- DR: active-passive hoặc geo-replication tùy quy mô bệnh viện.

### 2.2. Hệ thống lõi (Core HIS)

#### 2.2.1. Quản lý bệnh nhân
- Tạo hồ sơ, tra cứu, chỉnh sửa, tìm kiếm theo CMND/CCCD, điện thoại, bệnh án.
- Lịch sử khám, tiền sử bệnh, hồ sơ khám bệnh.
- Duy trì dữ liệu gốc bệnh nhân không bị trùng.

#### 2.2.2. Tiếp đón & hàng đợi
- Tạo lượt khám từ bệnh nhân.
- Cấp số, ưu tiên, chuyển phòng chờ.
- Triage ban đầu, đánh dấu mức độ nguy cấp.

#### 2.2.3. Khám bệnh/ngoại trú
- Lưu lý do khám, triệu chứng, sinh hiệu, tiền sử.
- Chẩn đoán ICD.
- Chỉ định dịch vụ/lab/imaging.
- Kê đơn và duyệt đơn thuốc.

#### 2.2.4. Điều trị nội trú
- Bệnh án điện tử nội trú.
- Quản lý giường bệnh.
- Lưu y lệnh, bệnh án, tiến triển bệnh.
- Phẫu thuật / thủ thuật / hồi sức.

#### 2.2.5. Viện phí & BHYT
- Tạo hóa đơn, thanh toán nhiều lần, công nợ.
- BHYT và doanh nghiệp quy định thanh toán phần bồi thường.
- Hoàn tiền, void payment, kiểm soát ca thu.

#### 2.2.6. Dược & kho vật tư
- Danh mục thuốc, nhà cung cấp, kiểm soát tồn kho, nhập/xuất/kiểm kê.
- Cấp phát thuốc cho bệnh nhân.
- Tồn kho, cảnh báo hết hàng, hạn dùng.

### 2.3. Các phân hệ tích hợp & liên kết

| Phân hệ | Vai trò | Yêu cầu thực thi |
|---|---|---|
| LIS | Xét nghiệm | Tích hợp 2 chiều: gửi chỉ định, nhận kết quả |
| RIS/PACS | Hình ảnh | Kết quả chẩn đoán hình ảnh, link bệnh nhân |
| BHYT | Giám định | Kiểm tra quyền lợi, thanh toán, đối soát |
| Bộ Y tế | Cổng dữ liệu | Mã BHYT, hồ sơ chất lượng, báo cáo quốc gia |
| Thiết bị y tế IoT | Monitor, máy xét nghiệm | Bộ đọc kết quả, chuẩn giao tiếp |

#### Lưu ý thiết kế tích hợp
- Tích hợp nên dùng chuẩn message bus + API + file batch tùy từng đối tác.
- Kết quả từ thiết bị phải có audit time, source, status.
- Mọi dữ liệu liên quan bảo hiểm phải đi qua kiểm tra hợp lệ và xác nhận trước khi lưu.

### 2.4. Yếu tố rủi ro & ràng buộc phụ thuộc

#### Ràng buộc thời gian / module
| Thứ tự bắt buộc | Module | Lý do |
|---|---|---|
| 1 | Hạ tầng, security, cấu hình DB | Không có nền tảng không thể triển khai |
| 2 | Bệnh nhân & lượt khám | Tất cả luồng điều trị bắt nguồn từ đây |
| 3 | Khám bệnh & chẩn đoán | Tạo dữ liệu EMR cần cho điều trị |
| 4 | Dược/kho | Thuốc và vật tư phụ thuộc vào đơn và điều trị |
| 5 | Viện phí/BHYT | Phải có dữ liệu lâm sàng thì mới có hóa đơn chính xác |
| 6 | CLS/LIS/PACS | Cho chuyên khoa cận lâm sàng và báo cáo |
| 7 | Dashboard & báo cáo | Chỉ triển khai sau khi dữ liệu đầu vào ổn |

#### Rủi ro nghiêm trọng
- Data migration từ hệ thống cũ sai định dạng hoặc trùng bệnh nhân.
- Mất điện / downtime ở hệ thống bệnh viện sẽ ảnh hưởng trực tiếp đến hoạt động tiếp đón và điều trị.
- Thiếu transaction xuyên module sẽ làm sai số lượng tồn kho, hóa đơn, công nợ.
- Cổng BHYT và cổng quốc gia nếu triển khai trễ sẽ làm gián đoạn thanh toán và báo cáo.
- Thiết bị báo lỗi hoặc không đồng bộ sẽ làm luồng xét nghiệm thất bại.

---

## 3. Nguyên tắc phân kỳ triển khai

### 3.1. Quy tắc thực tế triển khai HIS
- Không triển khai quá nhiều module cùng lúc trong một đợt nếu chưa có dữ liệu chuẩn và môi trường ổn định.
- Mỗi đợt phải có tính “đóng vòng” của nghiệp vụ: từ input -> xử lý -> output -> kiểm tra.
- Nếu module bắt buộc cho hoạt động điều trị hoặc thanh toán, phải có sẵn trước khi mở module tiếp theo.
- Mỗi giai đoạn phải có dữ liệu danh mục gốc, master data và cấu hình một lần.

### 3.2. Tách theo giai đoạn thực tế
- Đợt 0: chuẩn bị hạ tầng + dữ liệu danh mục + chuẩn dữ liệu.
- Đợt 1: pilot ngoại trú, focus vào flow kinh doanh có lợi nhuận và dễ khép vòng.
- Đợt 2: nội trú và chăm sóc chuyên sâu.
- Đợt 3: cận lâm sàng và tích hợp bên ngoài.
- Đợt 4: chuyển giao vận hành và go-live toàn viện.

---

## 4. Ma trận phụ thuộc (Dependency Matrix)

| Module / Phân hệ | Phụ thuộc trước | Tầm quan trọng | Ghi chú |
|---|---|---|---|
| Hạ tầng + IAM | Không | Rất cao | Bắt buộc trước mọi giai đoạn |
| Dữ liệu danh mục | Không | Rất cao | Thuốc, khoa, phòng, bác sĩ, dịch vụ |
| Bệnh nhân | Không | Rất cao | Nền tảng cho tất cả |
| Tiếp đón & hàng đợi | Bệnh nhân, danh mục | Cao | Là đầu vào khám |
| Khám bệnh/EMR ngoại trú | Tiếp đón, bệnh nhân | Cao | Cốt lõi của outpatient |
| Dược & kho | Khám bệnh, đơn thuốc | Cao | Có phụ thuộc vào đơn thuốc |
| Viện phí/BHYT | Khám bệnh, dược, dịch vụ | Cao | Thanh toán phải có dữ liệu đúng |
| Nội trú/EMR nội trú | Khám ngoại trú, khoa | Trung bình-cao | Sau khi ổn định ngoại trú |
| Phẫu thuật/thủ thuật | Nội trú + khoa | Trung bình | Phụ thuộc vào chuyên khoa |
| CLS/LIS/PACS | Khám bệnh, chẩn đoán | Cao | Có thể song hành sau giai đoạn 1 |
| Cổng BHYT/quốc gia | Viện phí, hồ sơ bệnh nhân | Cao | Sau khi module chính ổn |
| Báo cáo điều hành | Tất cả các module | Cao | Sau khi dữ liệu đúng |
| Go-live / chuyển giao | Tất cả | Rất cao | Giai đoạn kết thúc |

---

## 5. Kế hoạch chi tiết theo từng đợt

## 5.1. Đợt 0 – Chuẩn bị & Hạ tầng

### Mục tiêu chính
- Chuẩn hóa môi trường, cấu hình, bảo mật, chuẩn dữ liệu.
- Chuẩn bị data dictionary và master data.
- Bắt đầu với triển khai pilot trên một số khoa/phòng cụ thể.

### Thời gian ước tính & mốc
| Mốc | Mô tả | Thời gian ước tính |
|---|---|---|
| M0.1 | Khảo sát hiện trạng, yêu cầu bệnh viện | 1 tuần |
| M0.2 | Thiết kế kiến trúc, chuẩn dữ liệu, network | 1 tuần |
| M0.3 | Setup hạ tầng server/DB/security | 1–2 tuần |
| M0.4 | Seed master data và demo pilot | 1 tuần |
| M0.5 | UAT hạ tầng và kiểm tra vận hành ban đầu | 1 tuần |

### Phạm vi tính năng & phân hệ
- Mạng LAN/WAN bệnh viện
- Server VM/physical server
- SQL Server + backup
- IAM / RBAC / JWT
- Firewall, VPN, security baseline
- Dữ liệu danh mục gốc: khoa, phòng, bác sĩ, thuốc, giá dịch vụ, insurance code

### Hạng mục công việc kỹ thuật
- [ ] Khảo sát mạng và tần suất dùng hệ thống
- [ ] Thiết kế sơ đồ hạ tầng và topology
- [ ] Cài đặt môi trường dev/test/staging
- [ ] cấu hình bảo mật và secret management
- [ ] Đặt chuẩn code và migration DB
- [ ] Tạo data dictionary cho master data
- [ ] Thiết lập backup/restore, snapshot, retention
- [ ] Kiểm tra HA/DR plan và RTO/RPO

### Data Migration & Tích hợp
- Chạy inventory dữ liệu danh mục gốc từ Excel/CSV/legacy.
- Mapping dữ liệu cũ: khoa, phòng, bác sĩ, thuốc, cấu hình dịch vụ, BHYT.
- Validate duplicate và null values trước khi nhập.
- Tạo checklist migration với staging DB.

### Acceptance Criteria / DoD
- Hạ tầng API + DB + UI chạy ổn định trên môi trường test.
- Master data có dữ liệu sạch, không duplicate.
- Bảo mật và backup đã sẵn sàng.
- Môi trường pilot hoạt động, có lộ trình triển khai đầu tiên.

### Kế hoạch dự phòng / Rollback
- Nếu hạ tầng fail, rollback về state trước chuẩn bị.
- Không update cấu hình production trước khi test xong trên staging.
- Giữ snapshot DB và cấu hình trước khi go-live pilot.

---

## 5.2. Đợt 1 – Core HIS & Ngoại trú - Pilot

### Mục tiêu chính
Mở đầu giai đoạn core business của bệnh viện: bệnh nhân, tiếp đón, khám bệnh, thanh toán ngoại trú, cấp phát thuốc cơ bản.

### Thời gian ước tính & mốc
| Mốc | Mô tả | Thời gian ước tính |
|---|---|---|
| M1.1 | Xây dựng quản lý bệnh nhân | 1–2 tuần |
| M1.2 | Tiếp đón, hàng đợi, lịch hẹn | 1–2 tuần |
| M1.3 | Khám bệnh/EMR ngoại trú | 2 tuần |
| M1.4 | Đơn thuốc & cấp phát thuốc | 1–2 tuần |
| M1.5 | Viện phí & thanh toán BHYT | 1–2 tuần |
| M1.6 | UAT pilot và khởi chạy | 1 tuần |

### Phạm vi tính năng & phân hệ
- Quản lý bệnh nhân
- Tiếp đón & phân luồng
- Chẩn đoán ICD và hồ sơ khám ban đầu
- Kê đơn thuốc cơ bản
- Xuất kho / cấp phát thuốc cơ bản
- Hóa đơn và thanh toán ngoại trú
- Công nợ bệnh nhân và BHYT

### Hạng mục công việc kỹ thuật
- [ ] Data model patient, visit, diagnosis
- [ ] API tiếp đón và hàng đợi
- [ ] API start-exam / complete-exam
- [ ] Save examination + vitals + medical history
- [ ] Prescription create/approve/cancel
- [ ] Dispense inventory transaction
- [ ] Invoice generation and payment flow
- [ ] Security and role checks for medical staff
- [ ] Dashboard thống kê pilot

### Data Migration & Tích hợp
- Import bệnh nhân cũ từ Excel/legacy.
- Mapping giấy tờ bệnh nhân, mã BHYT, lịch khám cũ.
- Kiểm tra tồn kho thuốc đầu vào và cấu hình giá dịch vụ.
- Chạy đồng bộ dữ liệu với module thanh toán và thuốc.

### Acceptance Criteria / DoD
- Một bệnh nhân được tạo, tạo lượt khám, bắt đầu khám, kê đơn, cấp phát và thanh toán thành công trong môi trường pilot.
- Hóa đơn đúng số tiền và trạng thái công nợ.
- Tồn kho giảm đúng khi cấp phát.
- Hệ thống cho phép truy cập theo role đúng.

### Kế hoạch dự phòng / Rollback
- Pilot giới hạn trong 1–2 khoa/phòng.
- Nếu lỗi nghiêm trọng, tắt module mới và giữ quy trình cũ trong phòng đó.
- Backup snapshot trước khi mở pilot.

---

## 5.3. Đợt 2 – Nội trú & Chuyên sâu

### Mục tiêu chính
Mở rộng lên mô hình điều trị nội trú và chuyên khoa sâu, cần cho các bệnh viện có nhiều khoa, bệnh nhân lưu trú, phẫu thuật và cách chăm sóc cá thể hóa.

### Thời gian ước tính & mốc
| Mốc | Mô tả | Thời gian ước tính |
|---|---|---|
| M2.1 | Thiết kế EMR nội trú & patient stay | 1–2 tuần |
| M2.2 | Giường bệnh & chuyển khoa | 1 tuần |
| M2.3 | Y lệnh / thuốc lâm sàng | 1–2 tuần |
| M2.4 | Phẫu thuật/thủ thuật | 2 tuần |
| M2.5 | Dinh dưỡng & điều dưỡng | 1–2 tuần |
| M2.6 | UAT nội trú | 1 tuần |

### Phạm vi tính năng & phân hệ
- Bệnh án điện tử nội trú
- Quản lý giường bệnh/đặt giường
- Chuyển khoa và điều trị nội trú
- Điều dưỡng / y lệnh / tiến triển bệnh
- Dịch vụ phẫu thuật, thủ thuật
- Dược lâm sàng và thuốc điều trị nội trú

### Hạng mục công việc kỹ thuật
- [ ] EMR inpatient model và patient stay
- [ ] Chuyển khoa / room assignment / bed management
- [ ] Dinh dưỡng và việc chăm sóc chuyên sâu
- [ ] Drug administration và clinical order sets
- [ ] Surgery / procedure scheduling
- [ ] Clinical notes & progress notes
- [ ] Audit history for inpatient records

### Data Migration & Tích hợp
- Migrate dữ liệu giường bệnh, lịch sử bệnh án cũ, lịch phẫu thuật.
- Mapping dịch vụ tương ứng với tuyến điều trị nội trú.
- Đưa dữ liệu dược nội trú vào store chuẩn cho truy xuất và báo cáo.

### Acceptance Criteria / DoD
- Bệnh nhân nội trú có lưu trú, có tiến triển, có thuốc điều trị, có hóa đơn đúng theo dịch vụ.
- Không làm sai dữ liệu bệnh nhân khi chuyển khoa.
- Hệ thống đủ cho bệnh viện có mô hình nội trú thực tế.

### Kế hoạch dự phòng / Rollback
- Chạy module nội trú với nhóm khoa nhỏ trước khi mở rộng.
- Giữ workflow thủ công cho các khoa chưa sẵn sàng.
- Rollback về chế độ ngoại trú trước khi tiếp tục.

---

## 5.4. Đợt 3 – Tích hợp cận lâm sàng & Thiết bị

### Mục tiêu chính
Kết nối cận lâm sàng và dữ liệu ngoài hệ thống, tạo thành hệ thống điều trị tích hợp.

### Thời gian ước tính & mốc
| Mốc | Mô tả | Thời gian ước tính |
|---|---|---|
| M3.1 | Thiết kế interface tích hợp | 1 tuần |
| M3.2 | LIS và PACS/RIS | 2–3 tuần |
| M3.3 | Cổng BHYT & Bộ Y tế | 2–3 tuần |
| M3.4 | Dashboard điều hành | 1–2 tuần |
| M3.5 | UAT tích hợp | 1 tuần |

### Phạm vi tính năng & phân hệ
- LIS: chỉ định xét nghiệm -> nhận kết quả -> lưu vào hồ sơ bệnh án.
- PACS/RIS: hình ảnh, chỉ định chẩn đoán hình ảnh, kết quả đọc ảnh.
- Cổng BHYT: xác minh quyền lợi, đối soát, thanh toán.
- Cổng dữ liệu Bộ Y tế: báo cáo, chuyển dữ liệu theo chuẩn.
- Thiết bị y tế IoT và máy xét nghiệm.

### Hạng mục công việc kỹ thuật
- [ ] Tích hợp API chuẩn cho lab/imaging
- [ ] Message broker / queue pattern
- [ ] Kiểm tra tính toàn vẹn dữ liệu, payload mapping
- [ ] Tạo dashboard điều hành
- [ ] Kết nối chuẩn bảo hiểm và quốc gia
- [ ] Workflow xử lý lỗi và retry
- [ ] Áp dụng tiêu chuẩn bảo mật cho dữ liệu nhạy cảm

### Data Migration & Tích hợp
- Chuyển đổi cấu trúc lab/imaging theo chuẩn nội bộ.
- Dữ liệu cũ từ hệ thống cũ được mapping theo mã dịch vụ, bệnh nhân và kết quả.
- Chạy kiểm tra chéo dữ liệu PDF/CSV/API và sample kết quả trước khi production.

### Acceptance Criteria / DoD
- Dữ liệu xét nghiệm và hình ảnh show đúng trong bệnh án.
- Payment/claim BHYT nhận được dữ liệu đúng và đối soát được.
- Dashboard điều hành phản ánh đúng số liệu từ nguồn dữ liệu.

### Kế hoạch dự phòng / Rollback
- Giữ chế độ nhập liệu thủ công nếu integration lỗi.
- Chỉ bật tích hợp liên tục sau UAT trên chứng cứ và kiểm soát version API.
- Có fallback queue message và retry policy.

---

## 5.5. Đợt 4 – Nghiệm thu, Chuyển giao & Go-Live toàn diện

### Mục tiêu chính
Bước cuối cùng để chuẩn bị cho bệnh viện vận hành và chuyển giao hệ thống.

### Thời gian ước tính & mốc
| Mốc | Mô tả | Thời gian ước tính |
|---|---|---|
| M4.1 | Chạy song song / shadow mode | 1–2 tuần |
| M4.2 | Đào tạo và cert training | 1–2 tuần |
| M4.3 | UAT toàn viện | 1–2 tuần |
| M4.4 | Go-live & support chính thức | 1 tuần |
| M4.5 | Hỗ trợ sau go-live | 2–4 tuần |

### Phạm vi tính năng & phân hệ
- Nghiệm thu toàn diện truy cập mọi phân hệ
- Chạy song song với hệ thống cũ nếu cần
- Đào tạo staff
- Chuyển giao vận hành & duy trì hệ thống
- Kiểm tra DR và backup

### Hạng mục công việc kỹ thuật
- [ ] Kịch bản UAT toàn viện
- [ ] Chạy song song dữ liệu với hệ thống cũ
- [ ] Hỗ trợ onsite và ưu tiên sự cố
- [ ] Tạo playbook downtime và rollback
- [ ] Điều phối changelog và release note
- [ ] Chuyển giao source code, docs, SOP
- [ ] Tạo SLA và support model

### Data Migration & Tích hợp
- Chạy migration cuối cùng cho dữ liệu đã được đồng bộ.
- Validate dữ liệu cốt lõi theo từng module: khách hàng, khám, thuốc, hóa đơn, BHYT.
- Thực hiện data cutover được phê duyệt bằng sign-off.

### Acceptance Criteria / DoD
- Toàn viện sử dụng hệ thống tương ứng với quy trình được phê duyệt.
- Không có lỗi nghiêm trọng hay downtime gây ảnh hưởng trực tiếp đến chăm sóc người bệnh.
- Đội vận hành có quyền truy cập, SOP và backup rõ ràng.

### Kế hoạch dự phòng / Rollback
- Hệ thống cũ được giữ sẵn trong thời gian đảm bảo mức độ hỗ trợ.
- Rollback theo từng module: nếu module nào fail, tắt module đó và chạy thủ công trong thời gian ngắn.
- Dùng backup database theo từng checkpoint.

---

## 6. Ma trận phân bổ nguồn lực

| Vai trò | Nhiệm vụ chính | Đợt triển khai chính |
|---|---|---|
| Technical Lead / Solution Architect | Thiết kế kiến trúc, kiểm tra dependency, uỷ quyền quyết định kỹ thuật | Tất cả các đợt |
| Backend Engineer | API, DB, transaction, validation, service layer | Đợt 0–4 |
| Frontend Engineer | UI, workflow user, form, dashboard | Đợt 1–4 |
| Database Engineer | Schema, migration, performance, backup, index | Đợt 0–4 |
| QA / Test Lead | Test case, regression, UAT, automation | Đợt 1–4 |
| BA Y tế / Clinical Analyst | Mapping nghiệp vụ, form lâm sàng, workflow user, SOP | Đợt 0–4 |
| DevOps / Infra | Server, HA, monitoring, deployment pipeline | Đợt 0–4 |
| Đội On-site bệnh viện | Validate chuẩn nghiệp vụ, training, hỗ trợ go-live | Đợt 1–4 |
| Security / Compliance | RBAC, audit, secure config, access review | Đợt 0–4 |

---

## 7. Bảng rủi ro và phương án xử lý

| Rủi ro | Mức độ | Ảnh hưởng | Phương án xử lý |
|---|---|---|---|
| Dữ liệu cũ sai mẫu hoặc trùng lặp | Cao | Cao | Data cleansing, staging validation, 정합 data check |
| Thiếu transaction xuyên module | Cao | Rất cao | Tạo transaction cho exam-billing, dispense-stock |
| Lỗi quyền truy cập | Cao | Cao | RBAC + policy + user review |
| Downtime bệnh viện | Cao | Rất cao | HA/DR, rollback playbook, backup snapshot |
| Integration LIS/PACS lỗi thời gian | Trung bình | Cao | Queue + retry + manual fallback |
| Thiếu đào tạo người dùng | Trung bình | Trung bình | Training theo từng module + SOP |
| Độ chậm của dữ liệu báo cáo | Trung bình | Trung bình | Dữ liệu mart + ETL theo nhịp định kỳ |
| Chưa đủ mức độ chuẩn hóa dữ liệu BHYT | Cao | Cao | Kiểm tra mapping trước khi mở thanh toán BHYT |

---

## 8. Kết luận về lộ trình phân kỳ

### 8.1. Cách tiếp cận hợp lý
- Không triển khai toàn bộ HIS cùng một lúc trong một hệ thống bệnh viện thực tế.
- Nên chia theo chuỗi value chain: hạ tầng -> bệnh nhân -> khám -> thuốc -> thanh toán -> nội trú -> tích hợp -> báo cáo -> go-live.
- Mỗi đợt phải có “business closure”: input, process, output, validation.

### 8.2. Lộ trình đề xuất thực tế cho dự án hiện tại
- Nếu dự án là mô hình pilot 1 bệnh viện hoặc 1 trung tâm y tế, nên tập trung vào Đợt 0 + Đợt 1 + Đợt 2 (một phần) và có thể dừng ở Đợt 3 với integration mẫu.
- Nếu mục tiêu là xây hệ thống HIS chuẩn doanh nghiệp, cần thực hiện đầy đủ 5 đợt và có lực lượng vận hành hỗ trợ dài hạn.

### 8.3. Kết luận cuối
Hệ thống hiện tại trong repo có nền tảng tốt cho một hệ thống HIS ngoại trú, nhưng chưa đủ để triển khai toàn viện ngay lập tức. Sự thành công của dự án không nằm ở số lượng controller hay API, mà nằm ở độ gắn kết giữa dữ liệu lâm sàng, kho dược, thanh toán và bảo mật. Vì thế, các đợt triển khai phải theo thứ tự đúng logic nghề nghiệp của bệnh viện và tạo ra “loop kiểm soát” cho từng giai đoạn.

---

## 9. Bản tóm tắt theo format trình bày kế hoạch dự án

| Tiêu chí | Chi tiết |
|---|---|
| Mục tiêu | Triển khai HIS/EMR từ hạ tầng, tiếp đón, khám, thuốc, viện phí, nội trú, tích hợp, go-live |
| Phạm vi | On-premise hoặc hybrid cloud, có kiểm soát dữ liệu y tế |
| Đợt 0 | Hạ tầng, mạng, bảo mật, master data |
| Đợt 1 | Core HIS + ngoại trú + pilot |
| Đợt 2 | Nội trú + chuyên sâu |
| Đợt 3 | LAB/IMAGING/BHYT/dashboard |
| Đợt 4 | UAT, đào tạo, go-live |
| Chỉ số thành công | Dữ liệu sạch, luồng đặt lịch-khám-thuốc-hóa đơn chạy đúng, DR được test |
| Tần suất review | Mỗi sprint 2 tuần, mỗi đợt có demo và sign-off |

---

## 10. Mẫu checklist cho từng đợt

### Checklist đánh giá before phase start
- [ ] Đã có yêu cầu business được phê duyệt.
- [ ] Có master data chuẩn.
- [ ] Có hạ tầng và backup.
- [ ] Có security baseline.
- [ ] Có QA plan và test data.
- [ ] Đã xác định rollback plan.

### Checklist đánh giá phase complete
- [ ] Module dự án hoạt động trên staging.
- [ ] UAT pass theo kịch bản chính.
- [ ] Tạo được data migration report.
- [ ] Không xảy ra lỗi lỗi dữ liệu cốt lõi.
- [ ] Đã có sign-off từ BA y tế và PM.
- [ ] Đã cập nhật SOP và kế hoạch support.

---

Nếu cần, tôi có thể tiếp tục chuyển nội dung này thành:
1. một file Gooogle Doc/Markdown theo format management review, hoặc
2. một backlog Jira/Azure DevOps với user story + task + acceptance criteria theo từng đợt.
