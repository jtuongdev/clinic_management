# SƠ ĐỒ CẤU TRÚC MENU ADMIN HOÀN CHỈNH
# (Recommended Admin Sitemap – HIS ClinicManagement)

> **Ngày lập:** 2026-09-16  
> **Phiên bản:** 1.0.0  
> **Mục tiêu:** Cấu trúc menu đề xuất sau khi bổ sung đầy đủ các màn hình còn thiếu theo báo cáo Technical Lead HIS  
> **Chú thích trạng thái:**  
> - ✅ **Đã có** — Màn hình đã tồn tại trong AdminUI hiện tại  
> - ⚠️ **Cần nâng cấp** — Đã có nhưng thiếu trường/chức năng  
> - ❌ **Cần tạo mới** — Chưa có, cần phát triển từ đầu  
> - 🔴 **P0** | 🟡 **P1** | 🟢 **P2** — Mức độ ưu tiên  

---

## SITEMAP NAVIGATION TREE

```
HIS Admin Portal
│
├── 🏠 DASHBOARD & TỔNG QUAN
│   └── /dashboard ✅
│       ├── KPI Cards (BN, Lượt khám, Doanh thu, Công nợ)
│       ├── Timeline hoạt động gần đây
│       ├── Quick Actions
│       ├── Bảng nhắc việc công nợ
│       └── [MỚI] System Health Status Widget ❌ 🟢P2
│
├── 🏥 TIẾP ĐÓN & LỰA CHỌN BỆNH NHÂN
│   ├── /reception  ❌ 🔴P0 [MÀN HÌNH MỚI: Reception Workstation]
│   │   ├── Tìm kiếm bệnh nhân nhanh (CCCD/SĐT/Tên)
│   │   ├── Xem lịch hẹn hôm nay của BN được chọn
│   │   ├── Form tạo lượt khám chuẩn (POST /api/reception/visits)
│   │   └── In phiếu tiếp đón / số thứ tự
│   │
│   ├── /appointments  ❌ 🟡P1 [MÀN HÌNH MỚI: Appointment Management]
│   │   ├── /appointments — Danh sách lịch hẹn (filter: ngày, bác sĩ, khoa, trạng thái)
│   │   ├── /appointments/add — Tạo lịch hẹn mới
│   │   ├── /appointments/calendar — Xem lịch dạng tuần/tháng theo bác sĩ
│   │   └── /appointments/today — Lịch hẹn hôm nay (cần check-in)
│   │
│   └── /queue  ❌ 🟡P1 [MÀN HÌNH MỚI: Queue Monitor]
│       ├── Hàng đợi real-time toàn cơ sở (multi-khoa)
│       ├── Filter: Cơ sở, Khoa, Mức ưu tiên
│       ├── Gọi bệnh nhân vào phòng
│       └── Chuyển khoa / Đánh dấu No-show
│
├── 👤 BỆNH NHÂN
│   ├── /patients ✅ [Cần nâng cấp ⚠️]
│   │   ├── Danh sách + bộ lọc đa chiều ✅
│   │   ├── Tìm kiếm nhanh theo CCCD/SĐT ✅
│   │   ├── KPI bar thống kê ✅
│   │   └── Right sidebar xem nhanh ✅
│   │
│   ├── /patient/detail/:id ✅ [Cần nâng cấp ⚠️]
│   │   ├── Tab Tổng quan ✅
│   │   ├── Tab Cá nhân ✅
│   │   ├── Tab Hồ sơ bệnh án
│   │   │   ├── Lịch sử lượt khám ✅
│   │   │   ├── Đơn thuốc ✅
│   │   │   ├── Xét nghiệm / CLS ⚠️ [Cần thêm: normalRange, interpretation, bác sĩ duyệt]
│   │   │   └── Tiền sử bệnh ✅
│   │   ├── Tab Tài chính ✅
│   │   ├── Tab Bảo hiểm ✅
│   │   └── Tab Tài khoản ⚠️ [Cần thêm: kích hoạt/khóa, lịch sử đăng nhập]
│   │
│   └── /patient/add ✅ [Form tiếp đón — cần tách thành Reception Workstation riêng]
│
├── 🩺 KHÁM BỆNH & EMR
│   ├── /examination/overview ✅
│   ├── /examination/department ✅
│   │
│   ├── /examination/triage  ❌ 🔴P0 [MÀN HÌNH MỚI: Triage Workstation]
│   │   ├── Danh sách BN cần triage
│   │   ├── Form triage: sinh hiệu đầy đủ + mức ưu tiên
│   │   └── Gán phòng chờ sau triage
│   │
│   ├── /examination/list ✅ [Cần nâng cấp ⚠️]
│   │   ├── Danh sách lượt khám + filter ✅
│   │   ├── ActionBar: Bắt đầu / Hoàn tất / Hủy ✅
│   │   ├── [MỚI] State machine validation (chặn chuyển trạng thái sai)  ❌ 🔴P0
│   │   ├── [MỚI] Form hủy có nhập lý do  ❌ 🔴P0
│   │   └── [MỚI] Form chuyển khoa  ❌ 🟡P1
│   │
│   ├── /examination/emr-audit  ❌ 🔴P0 [MÀN HÌNH MỚI: EMR Audit Trail Viewer]
│   │   ├── Tra cứu audit theo BN/Lượt khám/Người dùng/Ngày
│   │   ├── Xem before/after JSON
│   │   ├── Mở khóa EMR đặc biệt (MEDICAL_RECORD_MANAGER)
│   │   └── Export CSV cho thanh tra
│   │
│   ├── /examination/patients ✅ [Cần nâng cấp → thêm thời gian chờ ước tính]
│   ├── /examination/cls  ⚠️ [Xem CLS.md cho chi tiết nâng cấp]
│   ├── /examination/pharmacy ✅
│   ├── /examination/finance ✅
│   ├── /examination/hr ✅
│   ├── /examination/facility ✅
│   └── /examination/reports ⚠️ [Cần thêm: theo bác sĩ, giờ, tỷ lệ AI]
│
├── 🔬 CẬN LÂM SÀNG (CLS)
│   ├── /cls/workstation  ❌ 🟡P1 [MÀN HÌNH MỚI: KTV Workstation]
│   │   ├── Danh sách chỉ định chờ tiếp nhận
│   │   ├── Form tiếp nhận mẫu (số mẫu, máy thực hiện)
│   │   ├── Form nhập kết quả (resultText, normalRange, interpretation)
│   │   └── Upload file PDF/DICOM/JPEG (drag-and-drop)
│   │
│   ├── /cls/approval  ❌ 🟡P1 [MÀN HÌNH MỚI: Bác sĩ CLS duyệt kết quả]
│   │   ├── Danh sách chờ duyệt (CHO_DUYET)
│   │   ├── Panel xem kết quả + file đính kèm
│   │   ├── Form duyệt: note, yeuCauLamLai
│   │   └── Alert kết quả bất thường (BAT_THUONG)
│   │
│   ├── /cls/monitoring  ⚠️ [Nâng cấp từ /examination/cls]
│   │   ├── Tổng quan trạng thái chỉ định theo loại/phòng
│   │   ├── [MỚI] Cảnh báo TAT vượt ngưỡng  ❌ 🟡P1
│   │   └── [MỚI] Alert bất thường real-time  ❌ 🟡P1
│   │
│   └── /cls/reports  ❌ 🟢P2 [MÀN HÌNH MỚI: Báo cáo CLS]
│       ├── Tỷ lệ hoàn thành theo loại dịch vụ
│       ├── TAT trung bình
│       └── Tỷ lệ bất thường theo loại XN
│
├── 💊 KHO & DƯỢC
│   ├── /inventory — Danh mục Thuốc & Vật tư ⚠️
│   │   └── [Cần bổ sung: số đăng ký, hoạt chất, mã BHYT, nhóm dược lý, đường dùng]  🔴P0
│   │
│   ├── /inventory/stock — Tồn kho theo lô ✅
│   │
│   ├── /inventory/expiry  ❌ 🟡P1 [MÀN HÌNH MỚI: Quản lý lô hết hạn tập trung]
│   │   ├── Danh sách lô sắp hết hạn (lọc 30/60/90 ngày)
│   │   ├── Thao tác hàng loạt: Hủy / Trả NCC
│   │   └── Lịch sử xử lý lô hết hạn
│   │
│   ├── /inventory/import — Nhập kho ✅
│   │
│   ├── /inventory/dispense — Cấp phát & Xuất kho ✅
│   │   └── [Cần thêm] Tab Reservation Management  ❌ 🟡P1
│   │       ├── Danh sách reservation đang hoạt động
│   │       └── Danh sách reservation hết hạn (để giải phóng)
│   │
│   ├── /inventory/transfer  ❌ 🟢P2 [MÀN HÌNH MỚI: Điều chuyển kho]
│   │   ├── Tạo phiếu điều chuyển (từ kho → đến kho)
│   │   ├── Duyệt phiếu
│   │   └── Lịch sử điều chuyển
│   │
│   ├── /inventory/stocktake — Kiểm kê ✅
│   ├── /inventory/suppliers — Nhà cung cấp ✅
│   │
│   └── /inventory/audit  ❌ 🟡P1 [MÀN HÌNH MỚI: Audit Giao dịch Kho]
│       ├── Log tất cả giao dịch (nhập/xuất/cấp phát/hủy)
│       ├── Filter: mặt hàng, lô, người dùng, loại GD, ngày
│       └── Export CSV
│
├── 💰 TÀI CHÍNH & VIỆN PHÍ
│   ├── /invoices — Danh sách hóa đơn ✅
│   │   └── [Cần thêm] Nút Chốt hóa đơn (Finalize)  ❌ 🟡P1
│   │
│   ├── /receipts — Phiếu thu ✅
│   │   └── [Cần thêm] Chức năng Void phiếu thu  ❌ 🔴P0
│   │
│   ├── /refunds  ❌ 🔴P0 [MÀN HÌNH MỚI: Quản lý Hoàn tiền]
│   │   ├── Danh sách yêu cầu hoàn tiền
│   │   ├── Form tạo phiếu hoàn tiền
│   │   ├── Phê duyệt hoàn tiền (Billing Supervisor)
│   │   └── In phiếu hoàn tiền
│   │
│   ├── /cashier-sessions  ❌ 🔴P0 [MÀN HÌNH MỚI: Quản lý Ca Thu ngân]
│   │   ├── Danh sách ca thu (theo ngày, theo cơ sở)
│   │   ├── Mở ca mới (nhập số tiền đầu ca)
│   │   ├── Xem tổng kết ca hiện tại
│   │   └── Đóng ca (nhập thực thu, xem variance)
│   │
│   ├── /debts — Công nợ ✅
│   │
│   ├── /reconciliation  ❌ 🟡P1 [MÀN HÌNH MỚI: Đối soát Cuối ngày]
│   │   ├── Chọn cơ sở + ngày
│   │   ├── Expected vs Actual (theo phương thức, theo ca)
│   │   ├── Variance highlight
│   │   └── Export PDF / Phê duyệt đối soát
│   │
│   └── /finance-reports  ❌ 🟢P2 [MÀN HÌNH MỚI: Báo cáo Tài chính]
│       ├── /finance-reports/revenue — Doanh thu theo kỳ, theo khoa, theo bác sĩ
│       ├── /finance-reports/payment-methods — Phân tích theo phương thức thanh toán
│       ├── /finance-reports/debt — Báo cáo công nợ tổng hợp
│       └── /finance-reports/insurance — Báo cáo BHYT (đã áp dụng, chờ đối soát)
│
├── 🏨 NỘI TRÚ
│   ├── /inpatient/bed-map  ❌ 🟢P2 [MÀN HÌNH MỚI: Sơ đồ Giường bệnh]
│   │   ├── Grid hiển thị tình trạng từng giường (Trống/Đang dùng/Bảo trì)
│   │   ├── Filter theo Khoa / Loại giường
│   │   └── Click vào giường → xem BN đang nằm
│   │
│   ├── /inpatient/admit  ❌ 🟢P2 [MÀN HÌNH MỚI: Nhận bệnh nội trú]
│   ├── /inpatient/treatment  ❌ 🟢P2 [MÀN HÌNH MỚI: Điều trị nội trú]
│   │   └── Danh sách BN nội trú, y lệnh, tiến triển
│   └── /inpatient/discharge  ❌ 🟢P2 [MÀN HÌNH MỚI: Xuất viện]
│
├── 👥 NHÂN SỰ & LỊCH LÀM VIỆC
│   ├── /employees ✅
│   │   └── [Cần thê] Màn hình Reset mật khẩu  ❌ 🔴P0
│   ├── /schedules ✅ (Lịch trực, Chấm công, Nghỉ phép)
│   └── /payroll ✅ (Tính lương, Duyệt, Chốt)
│
├── 🤖 AI & TÍCH HỢP
│   └── /ai  ❌ 🟢P2 [MÀN HÌNH MỚI: AI Monitoring Dashboard]
│       ├── Circuit Breaker Status (CLOSED/OPEN/HALF-OPEN)
│       ├── Biểu đồ request/giờ và tỷ lệ thành công
│       ├── Log gợi ý chẩn đoán (suggest-diagnosis)
│       ├── Log tương tác thuốc CRITICAL bị override
│       ├── Async EMR Analysis Jobs (PENDING/DONE/FAILED)
│       ├── Feedback Dashboard (rating từ bác sĩ)
│       └── Nút Emergency Killswitch AI
│
├── 📊 BÁO CÁO TỔNG HỢP
│   ├── /reports/medical  ❌ 🟢P2 [MÀN HÌNH MỚI: Báo cáo Lâm sàng]
│   │   ├── Thống kê lượt khám (theo kỳ, theo bác sĩ, theo ICD)
│   │   ├── Báo cáo CLS (TAT, tỷ lệ hoàn thành, bất thường)
│   │   └── Tỷ lệ tái khám
│   │
│   ├── /reports/finance  ❌ 🟢P2 → (xem /finance-reports)
│   │
│   └── /reports/inventory  ❌ 🟢P2 [MÀN HÌNH MỚI: Báo cáo Kho]
│       ├── Xuất nhập tồn theo kỳ
│       ├── Tiêu thụ thuốc theo bác sĩ/khoa
│       └── Chênh lệch kiểm kê
│
└── ⚙️ CẤU HÌNH HỆ THỐNG (SYSTEM ADMIN)
    │
    ├── DANH MỤC GỐC (Master Data)
    │   ├── /settings/facility  ❌ 🔴P0 — CRUD Cơ sở y tế
    │   ├── /settings/department  ❌ 🔴P0 — CRUD Khoa phòng
    │   ├── /settings/clinic-room  ❌ 🔴P0 — CRUD Phòng khám
    │   ├── /settings/icd10  ❌ 🟡P1 — Quản lý danh mục ICD-10
    │   ├── /settings/cls-services  ❌ 🟡P1 — CRUD Danh mục dịch vụ CLS
    │   ├── /settings/price-list  ❌ 🟡P1 — Quản lý Bảng giá Viện phí & BHYT
    │   └── /settings/insurance-types  ❌ 🟡P1 — Danh mục hình thức bảo hiểm
    │
    ├── PHÂN QUYỀN & BẢO MẬT (IAM / RBAC)
    │   ├── /settings/roles  ❌ 🔴P0 — CRUD Vai trò + Ma trận Permission
    │   ├── /settings/data-scope  ❌ 🔴P0 — Cấu hình phạm vi dữ liệu theo user
    │   ├── /settings/active-sessions  ❌ 🟢P2 — Phiên đăng nhập đang hoạt động
    │   └── /settings/security  ❌ 🟢P2 — Rate limit, session timeout, brute-force policy
    │
    ├── TÍCH HỢP HỆ THỐNG (Integration)
    │   ├── /settings/lis  ❌ 🟢P2 — Cấu hình kết nối LIS
    │   ├── /settings/pacs  ❌ 🟢P2 — Cấu hình kết nối PACS/RIS
    │   ├── /settings/bhxh-gateway  ❌ 🟢P2 — Cấu hình cổng BHXH/Bộ Y tế
    │   ├── /settings/api-keys  ❌ 🟢P2 — Quản lý API Keys / Webhooks
    │   ├── /settings/printers  ❌ 🟢P2 — Cấu hình máy in / tem nhãn
    │   └── /settings/notifications  ❌ 🟢P2 — Cấu hình SMTP / Webhook thông báo
    │
    ├── GIÁM SÁT & VẬN HÀNH (Monitoring & Ops)
    │   ├── /settings/audit-logs  ❌ 🔴P0 — Nhật ký kiểm toán (EMR, Billing, Kho, Auth)
    │   ├── /settings/health  ❌ 🟢P2 — Health Check tất cả dịch vụ
    │   └── /settings/background-jobs  ❌ 🟡P1 — Giám sát Background Jobs / Queue
    │
    └── THÔNG SỐ HỆ THỐNG (System Parameters)
        ├── /settings/params  ❌ 🟡P1 — Timezone, định dạng ngày, số thứ tự, quota khám/ngày
        └── /settings/ai-config  ❌ 🟢P2 — Endpoint AI, timeout, ngưỡng confidence
```

---

## BẢNG TÓM TẮT THEO NHÓM MENU

| Nhóm Menu | Màn hình hiện có | Màn hình cần tạo mới | Màn hình cần nâng cấp |
|---|:---:|:---:|:---:|
| Dashboard | 1 | 0 (thêm widget) | 1 |
| Tiếp đón | 0 | 3 (Reception, Appointments, Queue) | 0 |
| Bệnh nhân | 2 | 0 | 2 |
| Khám bệnh & EMR | 8 | 2 (Triage, EMR Audit) | 3 |
| Cận lâm sàng CLS | 1 | 3 (KTV WS, Approval, Reports) | 1 |
| Kho & Dược | 7 | 3 (Expiry, Transfer, Audit) | 2 |
| Tài chính & Viện phí | 3 | 4 (Refund, Cashier, Reconciliation, Reports) | 2 |
| Nội trú | 0 | 4 (BedMap, Admit, Treatment, Discharge) | 0 |
| Nhân sự | 3 | 0 (thêm Reset PW) | 1 |
| AI Monitoring | 0 | 1 | 0 |
| Báo cáo tổng hợp | 0 | 3 (Medical, Finance, Inventory) | 0 |
| Cấu hình Hệ thống | 0 | **13** | 0 |
| **TỔNG** | **25** | **36** | **12** |

---

## PHÂN TẦNG QUYỀN TRUY CẬP THEO ROLE (Role-based Route Access)

Cần cập nhật lại `ProtectedRoute.tsx` để bao gồm phân quyền route đầy đủ:

| Route | Roles được phép |
|---|---|
| `/reception` | ADMIN, NURSE, RECEPTIONIST |
| `/appointments/*` | ADMIN, NURSE, RECEPTIONIST, DOCTOR |
| `/queue` | ADMIN, NURSE, RECEPTIONIST |
| `/patients/*` | ADMIN, DOCTOR, NURSE |
| `/examination/*` | ADMIN, DOCTOR, NURSE |
| `/cls/workstation` | ADMIN, LAB_TECH, IMAGING_TECH |
| `/cls/approval` | ADMIN, DOCTOR, DOCTOR_CLS |
| `/inventory/*` | ADMIN, PHARMACIST, WAREHOUSE_STAFF |
| `/invoices`, `/receipts` | ADMIN, CASHIER, BILLING_SUPERVISOR |
| `/refunds`, `/cashier-sessions`, `/reconciliation` | ADMIN, BILLING_SUPERVISOR |
| `/payroll/*` | ADMIN, HR_MANAGER |
| `/schedules/*` | ADMIN, HR_MANAGER, NURSE |
| `/ai/*` | ADMIN, IT_ADMIN |
| `/settings/*` | ADMIN, IT_ADMIN |
| `/settings/roles`, `/settings/data-scope` | ADMIN (Super Admin only) |
| `/settings/audit-logs` | ADMIN, IT_ADMIN, AUDITOR |

---

## NGUYÊN TẮC THIẾT KẾ UI CHO CÁC MÀN HÌNH MỚI

### 1. Workstation Pattern (cho Reception, Triage, CLS KTV)
- Layout 2 panel: Danh sách bên trái (narrow) + Form/Detail bên phải (wide)
- Không dùng modal cho form phức tạp nhiều trường
- Luôn hiển thị thông tin BN ở header panel phải khi làm việc

### 2. Audit Viewer Pattern (cho EMR Audit, Billing Audit, Inventory Audit)
- Filter bar cố định trên cùng
- Bảng phân trang (50 rows/page)
- Row click → drawer/panel xem chi tiết before/after JSON (dạng diff)
- Nút Export CSV luôn visible

### 3. Dashboard Widget Pattern (cho Health Check, AI Monitoring)
- Card-based layout với status indicator màu (xanh/vàng/đỏ)
- Auto-refresh (configurable, default 30s)
- Không cần reload trang
- Click vào card → expand chi tiết

### 4. Master Data Pattern (cho Facility, Department, ICD-10, Price List)
- Table + Inline edit hoặc Slide-out Panel
- Import from Excel/CSV button ở toolbar
- Export button
- Phân biệt rõ trạng thái Active/Inactive bằng màu sắc

### 5. Cashier/Financial Pattern (cho Cashier Session, Reconciliation)
- Hiển thị số tiền lớn, rõ ràng
- Màu đỏ cho variance âm (thiếu), xanh cho variance dương (thừa)
- Không cho sửa khi đã chốt/đóng (readonly state)
- Bắt buộc confirm dialog trước khi đóng ca

---

## TIMELINE PHÁT TRIỂN ĐỀ XUẤT

| Giai đoạn | Thời gian | Nội dung |
|---|---|---|
| **Sprint 1 (P0 - Bảo mật & Danh mục)** | 2 tuần | Roles/Permissions, Data Scope, CRUD Facility/Dept/Room, Audit Log viewer, Bổ sung trường thuốc |
| **Sprint 2 (P0 - Tài chính & Vận hành)** | 2 tuần | Cashier Session, Void Payment, Refund, EMR Audit, State machine validation |
| **Sprint 3 (P1 - CLS & Tiếp đón)** | 2 tuần | KTV Workstation, CLS Approval, Triage Form, Queue Monitor, Appointment Management |
| **Sprint 4 (P1 - BI & Bảng giá)** | 2 tuần | Price List, ICD-10 Manager, Reconciliation, Invoice Finalize, Inventory Audit |
| **Sprint 5 (P2 - Báo cáo & Tích hợp)** | 3 tuần | Finance Reports, Medical Reports, Inventory Reports, Integration Config, AI Dashboard |
| **Sprint 6 (P2 - Nội trú)** | 3 tuần | Bed Map, Admit, Treatment, Discharge, Inpatient Reports |

**Tổng thời gian ước tính:** ~14 tuần (3.5 tháng) để hoàn thiện toàn bộ AdminUI theo chuẩn HIS

---

*© 2026 – Recommended Admin Sitemap – ClinicManagement HIS*
