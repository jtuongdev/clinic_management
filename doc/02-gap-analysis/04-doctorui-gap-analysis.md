# GAP ANALYSIS – DOCTOR UI vs. BÁO CÁO TECHNICAL LEAD HIS
## (Đánh giá Giao diện Bác sĩ theo 6 Trụ cột Lâm sàng)

> **Tác giả:** Clinical BA / Senior Frontend Architect  
> **Ngày lập:** 2026-09-16  
> **Phiên bản:** 1.0.0  
> **Phạm vi:** `ClinicManagement.DoctorUI` đối chiếu với `bao-cao-technical-lead-his` (7 file + 6 Flow lâm sàng FL-001 → FL-006)

---

## 1. TÓM TẮT MỨC ĐỘ SẴN SÀNG (READINESS SCORE)

### 1.1. Điểm tổng quan theo 6 Trụ cột Lâm sàng

| # | Trụ cột Lâm sàng | Trọng số | Điểm thực tế | Điểm đóng góp |
|:---:|---|:---:|:---:|:---:|
| 1 | Hàng đợi & Tiếp nhận (Queue + Triage) | 15% | 45% | 6.8% |
| 2 | Bệnh án & Tiền sử (EMR History) | 15% | 20% | 3.0% |
| 3 | Khám & Chẩn đoán ICD-10 | 20% | 72% | 14.4% |
| 4 | Chỉ định Cận lâm sàng (CPOE / CLS) | 15% | 38% | 5.7% |
| 5 | Kê đơn Thuốc điện tử (e-Prescription) | 20% | 8% | 1.6% |
| 6 | Kết luận & Xử trí (Disposition + EMR Lock) | 15% | 12% | 1.8% |
| | **TỔNG READINESS SCORE** | **100%** | | **33.3%** |

### 1.2. Phân loại theo trạng thái triển khai

| Trạng thái | Số màn hình/tính năng | % |
|---|:---:|:---:|
| ✅ **Hoàn toàn kết nối API & hoạt động** | 6 | 22% |
| ⚠️ **Có UI nhưng thiếu trường/API/logic quan trọng** | 9 | 33% |
| ❌ **100% Mock data hoặc hoàn toàn chưa implement** | 12 | 44% |

> **Nhận định tổng quan:** DoctorUI đã có kiến trúc phân tầng rõ ràng (4-step workspace: Patient → Examination → Treatment → EMR) và đã kết nối API thật cho luồng khám-chẩn đoán. Tuy nhiên, **hai trụ cột nguy hiểm nhất về an toàn lâm sàng** — Kê đơn thuốc (5% readiness) và Hoàn tất/Xử trí lâm sàng (12% readiness) — đang bị **tê liệt hoàn toàn**, gây rủi ro nghiêm trọng nếu đưa vào vận hành thực tế.

---

## 2. BẢNG GAP ANALYSIS NGHIỆP VỤ KHÁM BỆNH

**Chú thích:**
- ✅ **ĐẠT** — Đã có UI + API + validate đầy đủ theo chuẩn lâm sàng
- ⚠️ **THIẾU** — Đã có UI nhưng thiếu trường dữ liệu y tế hoặc logic lâm sàng cốt lõi
- ❌ **CHƯA CÓ** — Chưa triển khai hoặc 100% mock data không có giá trị sử dụng

---

### NHÓM 1: Hàng đợi & Tiếp nhận Bệnh nhân (Outpatient Queue)

| Phân hệ lâm sàng | Yêu cầu trong Báo cáo Tech Lead | File UI tương ứng | Đánh giá | Rủi ro lâm sàng nếu thiếu |
|---|---|---|:---:|---|
| Queue — Danh sách bệnh nhân chờ khám | `GET /api/LuotKham/hang-doi-list` theo bác sĩ, phân trang | `queue/components/QueuePanel.tsx` | ✅ ĐẠT | — |
| Queue — Bộ lọc theo trạng thái (CHO_KHAM, DANG_KHAM, HOAN_THANH) | Filter theo `trangThai` enum | `QueuePanel.tsx` - select dropdown | ✅ ĐẠT | — |
| Queue — Hiển thị mức ưu tiên (NORMAL / URGENT / EMERGENCY) | Flow-01 §6.5: Triage `priority` field bắt buộc | `QueuePanel.tsx` - cột Ưu tiên | ❌ CHƯA CÓ | Bác sĩ không biết ca nào là cấp cứu cần xử lý ngay; nguy hiểm tính mạng |
| Queue — Sinh hiệu ban đầu từ triage (HA, SpO2, Nhiệt độ) trong dòng danh sách | Flow-01 §6.5: `vitalSigns` trong triage response | `QueuePanel.tsx` | ❌ CHƯA CÓ | Bác sĩ không có thông tin nguy cấp ngay từ hàng đợi (HA=180, SpO2=85%) |
| Queue — Thời gian chờ ước tính (estimatedWaitMinutes) | Flow-01 §6.4 response: `estimatedWaitMinutes` | `QueuePanel.tsx` | ❌ CHƯA CÓ | Không ưu tiên được ca chờ lâu |
| Queue — Chi tiết nhanh bệnh nhân (Drawer/Overlay): dị ứng, BHYT, tiền sử | `DetailOverlay.tsx` | `shared/components/DetailOverlay.tsx` | ⚠️ THIẾU | Có overlay nhưng thông tin dị ứng **chưa kết nối API thực** (mock) |
| Triage — Form điều dưỡng nhập sinh hiệu + mức ưu tiên | Flow-01 `POST /api/LuotKham/{id}/triage` | **Chưa có màn hình** | ❌ CHƯA CÓ | Không phân loại được EMERGENCY; bệnh nhân đột quỵ xếp hàng như ca thường |
| Queue — Cập nhật real-time khi có bệnh nhân mới | Flow-01 §10 WebSocket `queue.{coSoId}.{khoaId}` | Không có SignalR/WebSocket | ❌ CHƯA CÓ | Bác sĩ phải F5 thủ công; bỏ lỡ ca cấp cứu mới tiếp nhận |
| Queue — Gọi bệnh nhân (chuyển trạng thái CHO_KHAM → DANG_KHAM) | `POST /api/LuotKham/{id}/start-exam` | `ExamPanel.tsx` nút "Bắt đầu khám" | ✅ ĐẠT | — |

---

### NHÓM 2: Bệnh án & Tiền sử (Clinical History / EMR View)

| Phân hệ lâm sàng | Yêu cầu trong Báo cáo Tech Lead | File UI tương ứng | Đánh giá | Rủi ro lâm sàng nếu thiếu |
|---|---|---|:---:|---|
| EMR — Thông tin hành chính bệnh nhân (readOnly) | `GET /api/luotkham/benh-nhan/{id}/thong-tin-benh-nhan` | `PatientWorkspace.tsx` | ✅ ĐẠT | — |
| EMR — Tiền sử bệnh (CRUD: thêm/sửa/xóa loại tiền sử) | `GET/POST` tiền sử trong `ExaminationWorkspace` | `ExaminationWorkspace.tsx` | ✅ ĐẠT | — |
| EMR — Cảnh báo dị ứng thuốc **nổi bật nguy hiểm** (màu đỏ, banner) | Flow-02: `allergies[]` trong medicalHistory; cảnh báo khi kê đơn | `ExaminationWorkspace.tsx` | ⚠️ THIẾU | Dị ứng chỉ lưu text bình thường, không có banner cảnh báo đỏ; bác sĩ kê thuốc gây dị ứng mà không hay |
| EMR — Lịch sử lượt khám cũ của bệnh nhân | `GET /api/BenhNhan/{id}/visits` | `records/components/RecordsPanel.tsx` | ❌ CHƯA CÓ | 100% mock — Bác sĩ không thấy được tiền sử điều trị từ trước |
| EMR — Xem đơn thuốc các lần khám cũ | `GET /api/BenhNhan/{id}/prescriptions` | `RecordsPanel.tsx` tab visits | ❌ CHƯA CÓ | Không biết BN đang dùng thuốc gì lâu dài; kê trùng thuốc mãn tính |
| EMR — Lịch sử kết quả xét nghiệm theo bệnh nhân | `GET /api/BenhNhan/{id}/lab-results` | `RecordsPanel.tsx` tab documents | ❌ CHƯA CÓ | Không so sánh được xu hướng chỉ số theo thời gian |
| EMR — Tra cứu bệnh án từ lượt khám cụ thể (theo visitId) | `GET /api/LuotKham/{id}/examination` | Hook `useExaminationForm` | ✅ ĐẠT | — |
| EMR — Audit trail xem/sửa hồ sơ (ai, lúc nào, IP) | Flow-02 §9: `emr_audit_log` | Không có màn hình | ❌ CHƯA CÓ | Vi phạm Thông tư 46/2018/TT-BYT |
| EMR — Khóa bệnh án (Lock record sau khi ký) | `POST /api/luot-kham/{id}/emr/lock` | Không có nút/chức năng lock | ❌ CHƯA CÓ | Hồ sơ có thể bị sửa sau khi đã in và giao cho bệnh nhân |

---

### NHÓM 3: Khám bệnh & Chẩn đoán ICD-10

| Phân hệ lâm sàng | Yêu cầu trong Báo cáo Tech Lead | File UI tương ứng | Đánh giá | Rủi ro lâm sàng nếu thiếu |
|---|---|---|:---:|---|
| Khám — Form nhập lý do khám (chief complaint) | Flow-02 §6.2: `chiefComplaint` bắt buộc | `ExaminationWorkspace.tsx` - textarea | ✅ ĐẠT | — |
| Khám — 7 chỉ số sinh hiệu (Nhiệt, Mạch, HA tâm thu, HA tâm trương, SpO2, Cân nặng, Chiều cao) | Flow-02 §6.2: `vitalSigns` object 8 fields | `ExaminationWorkspace.tsx` - 7 input số | ⚠️ THIẾU | **Thiếu nhịp thở (respiratoryRate)** — chỉ số quan trọng khi bệnh hô hấp |
| Khám — Tự động tính BMI từ cân nặng + chiều cao | Chuẩn HIS: BMI = kg/(m²) hiển thị ngay khi nhập | `ExaminationWorkspace.tsx` | ❌ CHƯA CÓ | Bác sĩ phải tính tay; thiếu indicator BMI (gầy/bình thường/béo phì) |
| Khám — Bệnh sử hiện tại (History of Present Illness) | Flow-02 §6.2: `historyOfPresentIllness` field | `ExaminationWorkspace.tsx` | ❌ CHƯA CÓ | Chỉ có lý do khám ngắn; thiếu diễn biến bệnh chi tiết cho chẩn đoán |
| Khám — Thuốc đang dùng hiện tại (currentMedications) | Flow-02 §6.2: `currentMedications[]` | `ExaminationWorkspace.tsx` | ❌ CHƯA CÓ | Không biết BN đang dùng thuốc khác; nguy cơ tương tác thuốc |
| Khám — Kết quả khám lâm sàng theo cơ quan (Physical Examination) | Chuẩn HIS: Tim, Phổi, Bụng, Thần kinh, Da liễu | `ExaminationWorkspace.tsx` | ❌ CHƯA CÓ | Thiếu structured PE; không đủ căn cứ lâm sàng để ghi vào bệnh án |
| Chẩn đoán — Tra cứu ICD-10 theo từ khóa (mã + tên) | `GET /api/LuotKham/icd?keyword={kw}` | `TreatmentWorkspace.tsx` - subtab diagnosis | ✅ ĐẠT | — |
| Chẩn đoán — Bảng gợi ý ICD-10 khi tìm kiếm | `useIcdSearch.ts` + bảng suggestion | `TreatmentWorkspace.tsx` | ✅ ĐẠT | — |
| Chẩn đoán — CRUD chẩn đoán (Thêm/Sửa/Xóa) | `POST/PUT/DELETE /api/LuotKham/{id}/diagnoses` | `useDiagnosisMutations.ts` | ✅ ĐẠT | — |
| Chẩn đoán — Validate chỉ 1 chẩn đoán chính | Flow-02 §7.1: `MULTIPLE_PRIMARY_DIAGNOSIS` rule | `useDiagnosisForm.ts` - toast.error | ✅ ĐẠT | — |
| Chẩn đoán — AI gợi ý ICD-10 từ triệu chứng | Flow-02 §6.6 `POST /api/ai/suggest-diagnosis` | Không có | ❌ CHƯA CÓ | Bỏ lỡ tính năng AI hỗ trợ chẩn đoán — giá trị HIS hiện đại |
| Khám — Ghi chú lâm sàng tổng hợp (Clinical Notes) | Flow-02: EMR `content_snapshot` JSONB | Không có textarea Clinical Notes riêng | ❌ CHƯA CÓ | Bác sĩ không ghi được nhận định lâm sàng tổng hợp |

---

### NHÓM 4: Chỉ định Cận lâm sàng (CPOE / CLS / LIS / RIS)

| Phân hệ lâm sàng | Yêu cầu trong Báo cáo Tech Lead | File UI tương ứng | Đánh giá | Rủi ro lâm sàng nếu thiếu |
|---|---|---|:---:|---|
| CLS — Chọn dịch vụ XN/CĐHA từ danh mục | `GET /api/LuotKham/danh-muc-dich-vu` | `TreatmentWorkspace.tsx` - subtab services | ✅ ĐẠT | — |
| CLS — Lưu chỉ định dịch vụ (POST) | `POST /api/LuotKham/{id}/chi-dinh-dich-vu` | `TreatmentWorkspace.tsx` | ✅ ĐẠT | — |
| CLS — Mức ưu tiên chỉ định (NORMAL / URGENT) | Flow-03 §6.1: `uuTien` field | `TreatmentWorkspace.tsx` - form chỉ định | ❌ CHƯA CÓ | Không ưu tiên được XN cấp cứu; kết quả trả về theo thứ tự thông thường |
| CLS — Ghi chú chỉ định cho KTV | Flow-03 §6.1: `ghiChu` field | `TreatmentWorkspace.tsx` | ❌ CHƯA CÓ | KTV không biết đặc điểm mẫu, điều kiện XN đặc biệt |
| CLS — Xem trạng thái kết quả (CHO_THUC_HIEN / TIEP_NHAN / DA_DUYET) | Flow-03: state machine 5 trạng thái | `TreatmentWorkspace.tsx` - cột trạng thái | ⚠️ THIẾU | Chỉ hiển thị 2 trạng thái (`DaChiDinh` / `DA_CO_KET_QUA`), thiếu `TIEP_NHAN`, `DANG_THUC_HIEN`, `CHO_DUYET` |
| CLS — Xem kết quả xét nghiệm thực tế (chỉ số, đơn vị, khoảng tham chiếu) | `GET /api/BenhNhan/{id}/lab-results` | `TreatmentWorkspace.tsx` - subtab results | ❌ CHƯA CÓ | **100% mock data** — bác sĩ không xem được kết quả thực tế từ phòng XN |
| CLS — Cảnh báo kết quả bất thường (in đậm đỏ khi vượt ngưỡng) | Flow-03 §6.5: `interpretation = BAT_THUONG` -> alert | `TreatmentWorkspace.tsx` | ❌ CHƯA CÓ | Bác sĩ không nhận diện được chỉ số nguy kịch (Kali máu thấp, Troponin cao) |
| CLS — Alert real-time khi kết quả về (WebSocket/notification) | Flow-03 §6.5: `BAT_THUONG` → notify bác sĩ chỉ định | Không có | ❌ CHƯA CÓ | Bác sĩ không biết có kết quả nguy kịch; chậm trễ điều trị |
| CLS — Xem file đính kèm (PDF/ảnh X-quang/DICOM) | Flow-03 §7: signed URL 24h, DICOM viewer | Không có viewer | ❌ CHƯA CÓ | Bác sĩ không xem được X-quang trong HIS; phải xem file rời |

---

### NHÓM 5: Kê đơn Thuốc điện tử (e-Prescription)

| Phân hệ lâm sàng | Yêu cầu trong Báo cáo Tech Lead | File UI tương ứng | Đánh giá | Rủi ro lâm sàng nếu thiếu |
|---|---|---|:---:|---|
| Đơn thuốc — Tạo đơn nháp ban đầu | `POST /api/luot-kham/{id}/don-thuoc` | `TreatmentWorkspace.tsx` - subtab prescription | ❌ CHƯA CÓ | Form hoàn toàn disabled; không kê được đơn thuốc |
| Đơn thuốc — Tìm kiếm và chọn thuốc từ kho | `GET /api/inventory/items?q=...&isActive=true` | `TreatmentWorkspace.tsx` - input thuốc `readOnly` | ❌ CHƯA CÓ | Bác sĩ không tra cứu được thuốc tồn kho; kê thuốc hết hàng |
| Đơn thuốc — Nhập số lượng, đơn vị, đường dùng | Flow-04 §5.2: `soLuong, donVi, duongDung` | Form input/select đều `disabled` | ❌ CHƯA CÓ | Thiếu thông tin dosing → lỗi liều thuốc nguy hiểm |
| Đơn thuốc — Hướng dẫn sử dụng (sáng/trưa/chiều/tối, trước/sau ăn) | Flow-04 §5.2: `huongDan` field | Không có | ❌ CHƯA CÓ | Bệnh nhân không biết cách dùng thuốc đúng thời điểm |
| Đơn thuốc — Số ngày dùng thuốc | Flow-04 §5.2: `soNgay` | Input `readOnly` | ❌ CHƯA CÓ | Không giới hạn được thời gian điều trị |
| Đơn thuốc — Duyệt đơn thuốc | `POST /api/luot-kham/{id}/don-thuoc/{id}/approve` | Nút "Lưu" chưa gắn API | ❌ CHƯA CÓ | Đơn không qua được workflow duyệt; dược sĩ không nhận được |
| Đơn thuốc — AI kiểm tra tương tác thuốc (SAFE/WARNING/CRITICAL) | Flow-04 §5.3: `POST /api/ai/drug-interaction-check` | Không có | ❌ CHƯA CÓ | **Nguy hiểm nghiêm trọng**: kê thuốc CRITICAL interaction mà không hay |
| Đơn thuốc — Cảnh báo kê thuốc trùng hoạt chất dị ứng | Flow-04 §5.3: CRITICAL → BLOCK đơn | Không có; chỉ có text tĩnh | ❌ CHƯA CÓ | Bệnh nhân sốc phản vệ do kê thuốc gây dị ứng đã biết |
| Đơn thuốc — Xem tồn kho trước khi kê (dispense preview) | `POST /api/inventory/prescriptions/{id}/dispense/preview` | Không có | ❌ CHƯA CÓ | Kê thuốc hết kho; bệnh nhân không lấy được thuốc |
| Đơn thuốc — Phân biệt đơn BHYT và đơn tự túc | Flow-04: `payerType` (BHYT vs CASH) | Không có field này | ❌ CHƯA CÓ | Tính tiền sai; BHYT chi trả sai loại thuốc |
| Đơn thuốc — In đơn thuốc | `GET /api/inventory/prescriptions/{id}/print-data` | Không có | ❌ CHƯA CÓ | Bệnh nhân không có đơn giấy để mua ngoài |

---

### NHÓM 6: Kết luận & Xử trí Lâm sàng (Clinical Disposition + EMR Lock)

| Phân hệ lâm sàng | Yêu cầu trong Báo cáo Tech Lead | File UI tương ứng | Đánh giá | Rủi ro lâm sàng nếu thiếu |
|---|---|---|:---:|---|
| Hoàn tất — Tóm tắt bệnh án điện tử (tổng hợp 4 bước) | Flow-02 §6.8: EMR summary trước khi lock | `ElectronicRecordWorkspace.tsx` | ✅ ĐẠT | — |
| Hoàn tất — Nút "Xác nhận & Hoàn tất" gọi API complete | `POST /api/LuotKham/{id}/complete` | `ElectronicRecordWorkspace.tsx` - nút có nhưng chỉ `alert()` | ⚠️ THIẾU | Lượt khám không khép kín; không sinh được hóa đơn; bệnh nhân không thanh toán được |
| Hoàn tất — Ký & Khóa hồ sơ EMR (Digital Sign/Lock) | `POST /api/luot-kham/{id}/emr/lock` + checksum SHA-256 | Không có nút Lock EMR | ❌ CHƯA CÓ | Hồ sơ có thể chỉnh sửa sau khi hoàn tất; vi phạm tính bất biến bệnh án |
| Xử trí — Cho về nhà + Kê đơn | Disposition: DISCHARGE | Chỉ có hoàn tất chung; không có lựa chọn | ❌ CHƯA CÓ | Không ghi nhận được quyết định lâm sàng rõ ràng |
| Xử trí — Hẹn tái khám (ngày, lý do, bác sĩ) | `POST /api/reception/appointments` | Không có form | ❌ CHƯA CÓ | Bệnh nhân không có lịch hẹn; dễ bỏ tái khám |
| Xử trí — Chỉ định nhập viện Nội trú (Admission) | Flow-02: Disposition ADMIT | Không có | ❌ CHƯA CÓ | Không số hóa được quyết định nhập viện |
| Xử trí — Chuyển viện / Chuyển tuyến (lập giấy chuyển) | Chuẩn HIS BHYT: giấy chuyển viện | Không có | ❌ CHƯA CÓ | Không lập được giấy chuyển tuyến điện tử theo quy định BHYT |
| Xử trí — Yêu cầu Hội chẩn (Consultation request) | Flow-02: tham vấn chuyên khoa | Không có | ❌ CHƯA CÓ | Hội chẩn phải làm bằng điện thoại/giấy; không lưu được vào hệ thống |
| In bệnh án | Nút "In bệnh án" trong ElectronicRecordWorkspace | `ElectronicRecordWorkspace.tsx` - nút có | ⚠️ THIẾU | Nút có nhưng **chưa gắn handler in thực tế** |

---

## 3. PHÂN TÍCH CÁC MODULE THEO MỨC ĐỘ HOÀN THIỆN

| Module | Route | Trạng thái API | Sẵn sàng lâm sàng | Ghi chú |
|---|---|:---:|:---:|---|
| Auth / Login | `/login` | ✅ Real API | ✅ 90% | Có check role BacSi chuẩn |
| Dashboard Overview | `/dashboard` | ❌ 100% Mock | ⚠️ 20% | KPI & thông tin không thực tế |
| Queue Management | `/queue` | ⚠️ Partial API | ⚠️ 50% | Thiếu priority, triage, real-time |
| Patient Workspace | `/exam` bước 1 | ✅ Real API | ✅ 75% | Thông tin hành chính đầy đủ |
| Examination Workspace | `/exam` bước 2 | ✅ Real API | ⚠️ 65% | Thiếu nhịp thở, BMI, HPI, PE |
| Diagnosis & ICD-10 | `/exam` bước 3 tab 1 | ✅ Real API | ✅ 80% | Gần hoàn chỉnh; thiếu AI suggest |
| CLS Services Ordering | `/exam` bước 3 tab 2 | ✅ Real API | ⚠️ 55% | Thiếu ưu tiên, ghi chú, trạng thái đầy đủ |
| CLS Results Viewing | `/exam` bước 3 tab 4 | ❌ 100% Mock | ❌ 5% | Kết quả XN hoàn toàn fake |
| e-Prescription | `/exam` bước 3 tab 3 | ❌ Disabled | ❌ 5% | **Tê liệt hoàn toàn** |
| EMR Finalization | `/exam` bước 4 | ⚠️ Alert only | ⚠️ 20% | Chưa gọi API complete; chưa lock |
| Medical Records History | `/records` | ❌ 100% Mock | ❌ 5% | Không có giá trị lâm sàng |
| Drug Catalog | `/catalog` | ❌ 100% Mock | ❌ 5% | Dữ liệu giả |
| Reports | `/reports` | ❌ Empty | ❌ 0% | Placeholder |
| System | `/system` | ❌ Empty | ❌ 0% | Placeholder + import bug |

---

## 4. LỖI KỸ THUẬT & KIẾN TRÚC CẦN SỬA NGAY

| # | Vấn đề | Mức độ | File liên quan |
|:---:|---|:---:|---|
| T1 | Nút "Xác nhận & Hoàn tất" gọi `alert()` thay vì `POST /api/LuotKham/{id}/complete` | 🔴 Nghiêm trọng | `useExam.ts` dòng 138 |
| T2 | Gọi bệnh nhân vào khám trong Queue chỉ dùng `window.confirm()` + `alert()` | 🔴 Nghiêm trọng | `QueuePanel.tsx` |
| T3 | Header trỏ `/overview` nhưng route đăng ký là `/dashboard` → tab Tổng quan không active | 🟡 Quan trọng | `Header.tsx`, `dashboard/routes.tsx` |
| T4 | `system/routes.tsx` import nhầm `ReportsPage.tsx` thay vì `SystemPage.tsx` | 🟡 Quan trọng | `system/routes.tsx` |
| T5 | Nút demo ICDModal cố định `position:fixed bottom:20px right:20px zIndex:50` che giao diện | 🟡 Quan trọng | `ICDModal.tsx` |
| T6 | Trùng lặp file: 2× `ActionToolbar.tsx`, 2× `MainLayout.tsx` | 🟡 Quan trọng | `components/` và `examination/components/` |
| T7 | Header hiển thị tên cứng "BS. Nguyễn Văn Tuấn" thay vì đọc từ AuthContext | 🟡 Quan trọng | `Header.tsx` |
| T8 | Không có `isDirty` guard: chuyển bệnh nhân mất dữ liệu form đang nhập | 🔴 Nghiêm trọng | `ExamPanel.tsx`, `useExam.ts` |
| T9 | Không có SignalR/polling → hàng đợi chỉ cập nhật khi F5 thủ công | 🟡 Quan trọng | `queue/api/axios.queue.api.ts` |
| T10 | `contextBar` sử dụng ngày/ca cứng hardcode (27/08/2026, Ca Sáng) | 🟢 Nhỏ | `ContextBar.tsx` |

---

*© 2026 – DoctorUI Gap Analysis – ClinicManagement HIS*
