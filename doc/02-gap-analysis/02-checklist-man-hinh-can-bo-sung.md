# CHECKLIST MÀN HÌNH & TRƯỜNG DỮ LIỆU CẦN BỔ SUNG
# (Phân loại theo ưu tiên P0 / P1 / P2)

> **Gắn liền với:** `01-executive-summary-va-gap-analysis.md`  
> **Ngày lập:** 2026-09-16  
> **Quy ước:**  
> - **P0 – Khẩn cấp**: Bắt buộc để hệ thống vận hành, thiếu là không dùng được / vi phạm pháp lý  
> - **P1 – Quan trọng**: Bắt buộc để hoàn thiện luồng nghiệp vụ và đảm bảo an toàn dữ liệu  
> - **P2 – Cải tiến**: Cần cho hiệu quả vận hành và mở rộng về sau  

---

## ═══ NHÓM P0 – KHẨN CẤP (Must-have trước go-live) ═══

### P0-01 | Màn hình Quản lý Vai trò & Phân quyền (Role & Permission Manager)
**Mô tả:** Màn hình CRUD danh sách Roles và ma trận Permission theo module/action.  
**Lý do P0:** ProtectedRoute hiện chỉ kiểm tra `roles=['Admin']`, gây lỗ hổng nghiêm trọng — thu ngân vào được màn hình EMR, bác sĩ vào được payroll.

**Trường dữ liệu bắt buộc:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `roleCode` | string | Mã vai trò: ADMIN, DOCTOR, NURSE, CASHIER, PHARMACIST, LAB_TECH |
| `roleName` | string | Tên hiển thị |
| `description` | string | Mô tả chức năng |
| `isSystem` | boolean | Vai trò hệ thống (không xóa được) |
| `permissions[]` | array | Danh sách permission: module + action (VIEW/CREATE/EDIT/DELETE/APPROVE) |

**Actions bắt buộc:**
- [ ] Tạo Role mới
- [ ] Sửa Role (tên, mô tả)
- [ ] Xem ma trận Permission (dạng checkbox grid: Roles × Modules)
- [ ] Toggle từng permission trong ma trận
- [ ] Xem danh sách nhân viên đang có role này

---

### P0-02 | Màn hình Cấu hình Data Scope (Phân quyền Dữ liệu theo Cơ sở/Khoa)
**Mô tả:** Cấu hình user chỉ xem dữ liệu của cơ sở/khoa được phân công.  
**Lý do P0:** Bác sĩ Khoa Nội đang có thể xem hồ sơ bệnh nhân Khoa Ngoại — vi phạm HIPAA/Thông tư 46.

**Trường dữ liệu bắt buộc:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `userId` | uuid | Nhân viên |
| `coSoIds[]` | array | Danh sách cơ sở được phép truy cập |
| `khoaIds[]` | array | Danh sách khoa được phép truy cập |
| `phongKhamIds[]` | array | Danh sách phòng khám (tùy chọn, chi tiết hơn) |
| `isAllFacilities` | boolean | Super admin: truy cập tất cả |

**Actions bắt buộc:**
- [ ] Xem scope hiện tại của một user
- [ ] Chỉnh sửa scope (thêm/bỏ cơ sở, khoa)
- [ ] Bulk assign scope cho nhiều user cùng role
- [ ] Lịch sử thay đổi scope (audit)

---

### P0-03 | Màn hình CRUD Cơ sở / Khoa / Phòng khám (Master Data: Facility, Dept, Room)
**Mô tả:** Ba màn hình CRUD cho dữ liệu danh mục gốc — hiện chỉ tồn tại dưới dạng hook dropdown.  
**Lý do P0:** Không có màn hình này, khi go-live không thể cấu hình cơ sở mới, thêm khoa hay phòng mới.

**Trường bắt buộc — Cơ sở (Facility):**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `maCoSo` | string | Unique |
| `tenCoSo` | string | |
| `diaChi` | string | |
| `dienThoai` | string | |
| `loaiCoSo` | enum | BENH_VIEN / PHONG_KHAM / TRUNG_TAM_Y_TE |
| `trangThai` | enum | ACTIVE / INACTIVE |
| `gioHoatDong` | string | VD: "07:00-17:00" |

**Trường bắt buộc — Khoa (Department):**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `maKhoa` | string | Unique |
| `tenKhoa` | string | |
| `coSoId` | uuid | FK |
| `loaiKhoa` | enum | NOI_TRU / NGOAI_TRU / CLS / DUOC / HANH_CHINH |
| `trangThai` | enum | ACTIVE / INACTIVE |
| `soGiuongToiDa` | int | Cho nội trú |

**Trường bắt buộc — Phòng khám (Clinic Room):**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `maPhong` | string | |
| `tenPhong` | string | |
| `khoaId` | uuid | FK |
| `loaiPhong` | enum | KHAM_BENH / XET_NGHIEM / CDHA / PHAU_THUAT / CAP_CUU |
| `sucChua` | int | Số BN tối đa/ngày |
| `trangThai` | enum | ACTIVE / MAINTENANCE / INACTIVE |

**Actions bắt buộc (cả 3 màn hình):**
- [ ] Thêm mới (Create)
- [ ] Sửa thông tin (Edit)
- [ ] Kích hoạt / Tắt (Toggle status)
- [ ] Xem danh sách với bộ lọc theo cơ sở cha
- [ ] Import từ Excel (batch create)

---

### P0-04 | Bổ sung trường y tế cốt lõi vào Danh mục Thuốc (ItemCatalogPage)
**Mô tả:** Bổ sung các trường bắt buộc của HIS mà hiện ItemCatalogPage đang thiếu.  
**Lý do P0:** AI drug interaction check yêu cầu `activeIngredient`; thanh toán BHYT yêu cầu `bhytMappingCode`.

**Trường cần BỔ SUNG vào form thuốc:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `soMaDangKy` | string | Số đăng ký của Bộ Y tế (VD: VD-12345-16) |
| `hoatChat` | string | Active ingredient (VD: Amoxicillin) |
| `hàmLuong` | string | Hàm lượng (VD: 500mg) |
| `dangBaoChe` | enum | VIEN_NEN / CAPSULE / SIRO / TIEM / TRUYEN / KEM / NHAM |
| `duongDung` | enum | UONG / TIEM_BAP / TIEM_TINH_MACH / BOI / NHO_MAT |
| `nhomDuocLy` | string | ATC Level 3 (VD: J01CA — Beta-lactam penicillins) |
| `maBhytMapping` | string | Mã ánh xạ BHYT theo Thông tư 30 |
| `hanDungMacDinh` | int | Số tháng hạn dùng mặc định khi nhập kho |
| `canKeDon` | boolean | Thuốc kê đơn bắt buộc |
| `canKiemSoatDacBiet` | boolean | Thuốc gây nghiện/hướng thần cần kiểm soát đặc biệt |
| `nhomThuoc` | enum | THUOC / VAT_TU_Y_TE / HOA_CHAT / THIET_BI |
| `donViQuyDoi[]` | array | VD: [{donViNho: "viên", donViLon: "vỉ", heSoQuyDoi: 10}] |

**Actions cần bổ sung:**
- [ ] Validate số đăng ký không trùng
- [ ] Cảnh báo khi nhập thuốc có cùng hoạt chất và hàm lượng (duplicate detection)
- [ ] Lọc danh sách theo nhóm dược lý / nhóm BHYT

---

### P0-05 | Màn hình Audit Log Tổng hợp (System Audit Trail Viewer)
**Mô tả:** Giao diện tra cứu nhật ký kiểm toán toàn hệ thống.  
**Lý do P0:** Thông tư 46/2018/TT-BYT quy định bắt buộc có audit trail bệnh án. Thiếu vi phạm pháp lý.

**Trường filter bắt buộc:**

| Filter | Kiểu | Ghi chú |
|---|---|---|
| `module` | enum | EMR / BILLING / INVENTORY / AUTH / SYSTEM |
| `action` | string | START_EXAM / EMR_LOCKED / PAYMENT / DISPENSE / LOGIN... |
| `userId` | uuid | Người thực hiện |
| `fromDate` / `toDate` | date | Khoảng thời gian |
| `benhNhanId` | uuid | Tra cứu theo bệnh nhân cụ thể |
| `ipAddress` | string | Lọc theo IP |

**Cột dữ liệu hiển thị:**

| Cột | Mô tả |
|---|---|
| Thời gian | Timestamp với timezone |
| Người dùng | Tên + username + IP |
| Hành động | Action code + mô tả |
| Module | EMR / Billing / Kho... |
| Đối tượng | ID bệnh nhân / lượt khám / hóa đơn |
| Trước | JSON before snapshot |
| Sau | JSON after snapshot |

**Actions bắt buộc:**
- [ ] Tìm kiếm với bộ filter đa chiều
- [ ] Xem chi tiết before/after của từng log entry
- [ ] Export CSV/Excel (dùng cho báo cáo thanh tra)
- [ ] Phân trang (50 records/page)

---

### P0-06 | Màn hình Quản lý Ca Thu ngân (Cashier Session Management)
**Mô tả:** Mở ca/đóng ca thu ngân theo ca làm việc, đối soát tiền mặt.  
**Lý do P0:** Flow-05 (Billing) yêu cầu bắt buộc có cashier session trước khi ghi nhận thanh toán tiền mặt.

**Trường dữ liệu:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `cashierId` | uuid | Thu ngân |
| `shiftId` | uuid | Ca trực |
| `openingAmount` | decimal | Số tiền đầu ca (tiền mặt) |
| `closingAmount` | decimal | Số tiền kết ca (thực thu) |
| `expectedAmount` | decimal | Dự kiến thu (tính tự động) |
| `variance` | decimal | Chênh lệch (tính tự động) |
| `trangThai` | enum | OPEN / CLOSED |
| `openedAt` / `closedAt` | datetime | |

**Actions:**
- [ ] Mở ca mới (kèm nhập tiền đầu ca)
- [ ] Xem tổng kết ca hiện tại (các giao dịch trong ca)
- [ ] Đóng ca (nhập thực thu, tự tính variance)
- [ ] Xem lịch sử các ca đã đóng
- [ ] Cảnh báo nếu variance > ngưỡng cho phép (VD: > 50,000 VNĐ)

---

### P0-07 | Màn hình Hoàn tiền & Void Phiếu thu (Refund & Void Payment)
**Mô tả:** Xử lý trường hợp thu tiền nhầm, cần hủy phiếu thu hoặc hoàn tiền cho bệnh nhân.  
**Lý do P0:** Không có màn hình này thì tiền thu nhầm không có đường xử lý hợp lệ — phải làm tắt hoặc xóa DB.

**Void Payment — Trường bắt buộc:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `paymentId` | uuid | Phiếu thu cần hủy |
| `reason` | string | Lý do hủy (bắt buộc, tối thiểu 20 ký tự) |
| `approvedBy` | uuid | Người duyệt (cấp trên thu ngân) |

**Refund — Trường bắt buộc:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `invoiceId` | uuid | Hóa đơn gốc |
| `amount` | decimal | Số tiền hoàn |
| `reason` | string | Lý do hoàn tiền |
| `refundMethod` | enum | TIEN_MAT / CHUYEN_KHOAN |
| `refundReference` | string | Số phiếu hoàn |

**Actions:**
- [ ] Void phiếu thu (chỉ trong ngày, chưa đóng ca)
- [ ] Tạo phiếu hoàn tiền (khi hóa đơn đã finalize)
- [ ] Phê duyệt hoàn tiền (Billing Supervisor)
- [ ] In phiếu hoàn tiền

---

## ═══ NHÓM P1 – QUAN TRỌNG (Cần có trong Sprint đầu tiên sau go-live) ═══

### P1-01 | Workstation Kỹ thuật viên CLS (CLS Technician Workstation)
**Mô tả:** Màn hình dành riêng cho KTV để tiếp nhận mẫu, ghi kết quả, upload file.

**Trường/Thành phần bắt buộc:**

| Thành phần | Chi tiết |
|---|---|
| Danh sách chỉ định chờ | Filter theo: Loại (XN/CĐHA/thăm dò), Phòng CLS, Mức ưu tiên |
| Form Tiếp nhận mẫu | soMau, receivedAt, mayThucHien, ghiChuTiepNhan |
| Form Nhập kết quả | resultText, normalRange, unit, interpretation (BINH_THUONG / CANH_BAO / BAT_THUONG), ghiChuKTV, completedAt |
| Upload file | PDF/DICOM/JPEG/PNG, drag-and-drop, progress bar, max 50MB/file, 10 files/lần |
| Trạng thái real-time | Badge đếm số chỉ định theo trạng thái |

**Actions:**
- [ ] Tiếp nhận mẫu (POST /api/chi-dinh/{id}/receive)
- [ ] Bắt đầu thực hiện (POST /api/chi-dinh/{id}/perform)
- [ ] Nhập kết quả + upload file (POST /api/chi-dinh/{id}/result multipart)
- [ ] Xem lịch sử chỉ định đã hoàn tất hôm nay

---

### P1-02 | Màn hình Duyệt Kết quả CLS (CLS Result Approval)
**Mô tả:** Bác sĩ CLS duyệt kết quả trước khi cập nhật vào EMR bệnh nhân.

**Trường/Thành phần:**

| Thành phần | Chi tiết |
|---|---|
| Danh sách chờ duyệt | Filter theo loại, ngày, mức ưu tiên, bất thường/bình thường |
| Panel xem kết quả | resultText, normalRange, interpretation, file đính kèm (viewer PDF/image) |
| Form duyệt | note, doiChieuLamSang, yeuCauLamLai (boolean) |
| Alert bất thường | Highlight đỏ khi interpretation = BAT_THUONG |

**Actions:**
- [ ] Duyệt kết quả (POST /api/chi-dinh/{id}/approve-result)
- [ ] Yêu cầu làm lại (tạo chỉ định mới, hủy chỉ định cũ)
- [ ] Xem hồ sơ bệnh nhân liên quan

---

### P1-03 | Màn hình Quản lý Lịch hẹn (Appointment Management)
**Mô tả:** Tạo, xem, xác nhận, hủy lịch hẹn khám bệnh.

**Trường bắt buộc:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `benhNhanId` | uuid | |
| `coSoId` | uuid | |
| `khoaId` | uuid | |
| `bacSiId` | uuid | Tùy chọn |
| `timeSlot` | datetime | Khung giờ hẹn |
| `loaiKham` | enum | TAI_KHAM / KHAM_MOI / THEO_DOI |
| `payerType` | enum | CASH / BHYT / CORPORATE |
| `ghiChu` | string | |
| `trangThai` | enum | PENDING / CONFIRMED / CHECKED_IN / CANCELLED / NO_SHOW |

**Views bắt buộc:**
- [ ] Lịch xem theo tuần (week view) theo bác sĩ/khoa
- [ ] Danh sách lịch hẹn hôm nay theo cơ sở
- [ ] Tạo lịch hẹn mới (form)
- [ ] Xác nhận / Hủy lịch hẹn
- [ ] Check-in (liên kết tạo lượt khám)

---

### P1-04 | Màn hình Triage & Reception Workstation
**Mô tả:** Màn hình dành riêng cho điều dưỡng tiếp đón — không phải form admin tổng quát.

**Trường sinh hiệu bắt buộc trong Triage form:**

| Trường | Kiểu | Unit | Ghi chú |
|---|---|---|---|
| `huyetAp` | string | mmHg | VD: "120/80" |
| `nhipTim` | int | bpm | |
| `nhietDo` | decimal | °C | |
| `spO2` | int | % | |
| `nhipTho` | int | lần/phút | |
| `canNang` | decimal | kg | |
| `chieuCao` | decimal | cm | |
| `priority` | enum | | NORMAL / URGENT / EMERGENCY |
| `note` | string | | Ghi chú triage |

**Actions:**
- [ ] Tìm kiếm bệnh nhân theo CCCD/SĐT (instant search)
- [ ] Xem lịch hẹn hôm nay của BN được chọn
- [ ] Tạo lượt khám (POST /api/reception/visits)
- [ ] Nhập triage (POST /api/LuotKham/{id}/triage)
- [ ] Hủy lượt có nhập lý do

---

### P1-05 | Màn hình Quản lý Hàng đợi Real-time (Queue Monitor)
**Mô tả:** Màn hình điều phối viên xem toàn bộ hàng đợi theo cơ sở, có cập nhật real-time.

**Thành phần:**

| Thành phần | Chi tiết |
|---|---|
| Bộ lọc | Cơ sở, Khoa, Trạng thái, Mức ưu tiên |
| Bảng hàng đợi | Số thứ tự, Tên BN, Thời gian chờ (phút), Priority badge, Phòng được giao, Trạng thái |
| Chỉ báo tải | Số BN chờ / số phòng đang mở theo khoa |
| Thời gian chờ | Tự tính: thời điểm tiếp nhận đến hiện tại |

**Actions:**
- [ ] Gọi bệnh nhân vào phòng (chuyển sang DANG_KHAM)
- [ ] Chuyển khoa/phòng (với lý do)
- [ ] Đánh dấu No-show sau 3 lần gọi không có mặt
- [ ] WebSocket real-time update (không cần F5)

---

### P1-06 | Màn hình Đối soát Cuối ngày (Daily Reconciliation)
**Mô tả:** Thu ngân / Giám sát Billing thực hiện đối soát doanh thu cuối ngày.

**Thành phần:**

| Thành phần | Chi tiết |
|---|---|
| Bộ lọc | Cơ sở, Ngày |
| Tổng Expected | Tính từ tất cả HĐ đã thu trong ngày |
| Tổng Actual | Tổng các ca thu đã đóng trong ngày |
| Variance | Expected - Actual (highlight đỏ nếu vượt ngưỡng) |
| Chi tiết theo phương thức | Tiền mặt / Thẻ / Chuyển khoản / BHYT |
| Chi tiết theo ca thu ngân | Từng ca với người phụ trách |

**Actions:**
- [ ] Xem báo cáo đối soát
- [ ] Export Excel/PDF
- [ ] Ghi chú giải thích chênh lệch
- [ ] Phê duyệt đối soát (Billing Supervisor)

---

### P1-07 | Màn hình Chốt Hóa đơn Bất biến (Invoice Finalization)
**Mô tả:** Thu ngân/Giám sát chốt hóa đơn sau khi thu xong, tạo số hóa đơn chuẩn.

**Actions:**
- [ ] Chốt hóa đơn (POST /api/billing/invoices/{id}/finalize)
- [ ] Hiển thị số hóa đơn HD-YYYY-XXXXXX sau khi chốt
- [ ] Ngăn mọi chỉnh sửa sau khi finalize (disable các button edit/cancel)
- [ ] In hóa đơn chính thức (khác với phiếu thu tạm)

---

### P1-08 | Màn hình Audit Kho Dược (Inventory Audit Log Viewer)
**Mô tả:** Tra cứu lịch sử giao dịch kho theo người, theo mặt hàng, theo lô.

**Filter bắt buộc:**

| Filter | Kiểu |
|---|---|
| `loaiGiaoDich` | enum: NHAP / XUAT / CAP_PHAT / TRA / HUY / KIEM_KE |
| `itemId` | Mặt hàng |
| `soLo` | Số lô |
| `userId` | Người thực hiện |
| `fromDate` / `toDate` | Khoảng thời gian |

**Cột dữ liệu:**
- Thời gian, Loại giao dịch, Mặt hàng, Số lô, Số lượng, Người thực hiện, Tham chiếu (phiếu nhập/đơn thuốc), Ghi chú

**Actions:**
- [ ] Tìm kiếm đa chiều
- [ ] Export CSV
- [ ] Xem chi tiết phiếu giao dịch

---

### P1-09 | Màn hình Quản lý Bảng Giá Viện phí & BHYT (Price List Management)
**Mô tả:** Admin nhập và quản lý bảng giá có hiệu lực theo thời gian.

**Trường bắt buộc:**

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `maGia` | string | Mã bảng giá |
| `tenBangGia` | string | VD: "Bảng giá 2026 Q3" |
| `loai` | enum | VIEN_PHI / BHYT / BAO_HIEM_DN |
| `hieulucTu` | date | Ngày bắt đầu áp dụng |
| `hieulucDen` | date | Ngày hết hiệu lực |
| `chiTiet[]` | array | Danh sách dịch vụ + giá áp dụng |
| `trangThai` | enum | DRAFT / ACTIVE / EXPIRED |

**Actions:**
- [ ] Tạo bảng giá mới (DRAFT)
- [ ] Thêm dịch vụ vào bảng giá
- [ ] Import bảng giá từ Excel
- [ ] Kích hoạt bảng giá (set ACTIVE)
- [ ] Xem lịch sử các bảng giá đã áp dụng
- [ ] So sánh 2 bảng giá

---

### P1-10 | Màn hình Quản lý Danh mục ICD-10 (ICD-10 Catalog Manager)
**Mô tả:** Admin cập nhật, đồng bộ danh mục ICD-10 theo phiên bản Bộ Y tế.

**Trường:**

| Trường | Kiểu |
|---|---|
| `icdCode` | string (unique) |
| `icdName` | string |
| `icdNameEn` | string |
| `category` | string (block VD: J00-J06) |
| `chapter` | string |
| `isActive` | boolean |

**Actions:**
- [ ] Tìm kiếm ICD theo code hoặc tên
- [ ] Kích hoạt / Tắt mã ICD
- [ ] Import batch từ file CSV (cập nhật phiên bản mới)
- [ ] Xuất danh mục hiện tại

---

## ═══ NHÓM P2 – CẢI TIẾN (Triển khai sau khi ổn định P0+P1) ═══

### P2-01 | Dashboard AI Monitoring
**Thành phần cần có:**
- [ ] Circuit Breaker status indicator (CLOSED=xanh / OPEN=đỏ / HALF-OPEN=vàng)
- [ ] Biểu đồ số request AI / giờ
- [ ] Tỷ lệ suggestions được bác sĩ chấp nhận
- [ ] Danh sách drug interaction CRITICAL đã bị override (cần theo dõi)
- [ ] Trạng thái async EMR analysis jobs (PENDING/DONE/FAILED)
- [ ] Nút bật/tắt AI Service thủ công (Emergency killswitch)

---

### P2-02 | Báo cáo Doanh thu & Tài chính (Finance Reports)
**Màn hình cần tạo:**
- [ ] Báo cáo doanh thu theo ngày/tuần/tháng/năm
- [ ] Phân tích doanh thu theo phương thức (tiền mặt, thẻ, BHYT, doanh nghiệp)
- [ ] Báo cáo doanh thu theo bác sĩ / khoa / cơ sở
- [ ] Báo cáo công nợ tổng hợp
- [ ] Biểu đồ xu hướng doanh thu (line chart)
- [ ] Export Excel / PDF

---

### P2-03 | Báo cáo Kho Dược Toàn diện (Inventory Reports)
**Màn hình cần tạo:**
- [ ] Báo cáo xuất nhập tồn theo kỳ
- [ ] Báo cáo sử dụng thuốc theo bệnh nhân / bác sĩ / khoa
- [ ] Báo cáo lô sắp hết hạn (theo khoảng thời gian lọc)
- [ ] Báo cáo chi phí thuốc / vật tư y tế
- [ ] Báo cáo kiểm kê (chênh lệch thực tế vs. sổ sách)

---

### P2-04 | Báo cáo CLS & Hoạt động Lâm sàng
**Màn hình cần tạo:**
- [ ] Tỷ lệ hoàn thành CLS theo loại dịch vụ
- [ ] Thời gian TAT (Turn-Around-Time) trung bình theo loại XN
- [ ] Tỷ lệ kết quả bất thường theo loại XN và khoa chỉ định
- [ ] Thống kê lượt khám theo bác sĩ / khoa / cơ sở
- [ ] Tỷ lệ tái khám (follow-up rate)

---

### P2-05 | Màn hình Quản lý Nội trú (Inpatient Management)
**Màn hình cần tạo:**
- [ ] Sơ đồ giường bệnh (Bed Map) — dạng grid hiển thị tình trạng từng giường
- [ ] Màn hình nhận bệnh nội trú (Admit)
- [ ] Màn hình chuyển giường / chuyển khoa
- [ ] Màn hình xuất viện (Discharge)
- [ ] Báo cáo tỷ lệ sử dụng giường (Bed Occupancy Rate)

---

### P2-06 | Cấu hình Tích hợp Hệ thống (Integration Settings)
**Màn hình cần tạo:**
- [ ] Cấu hình kết nối LIS (URL, auth, test connection)
- [ ] Cấu hình kết nối PACS/RIS
- [ ] Cấu hình cổng BHXH (endpoint, API key, certificate upload)
- [ ] Cấu hình máy in (chọn printer, khổ giấy, test print)
- [ ] Cấu hình SMTP / Webhook thông báo
- [ ] Quản lý API Keys (tạo, thu hồi, xem last used)

---

### P2-07 | Màn hình Quản lý Lô Hết hạn Tập trung (Expiry Management)
**Thành phần:**
- [ ] Danh sách lô sắp hết hạn (lọc: trong 30/60/90 ngày)
- [ ] Gom nhóm theo mặt hàng
- [ ] Thao tác hàng loạt: Lập phiếu hủy / Lập phiếu trả nhà cung cấp
- [ ] Lịch sử xử lý lô hết hạn

---

### P2-08 | Màn hình Điều chuyển Kho (Stock Transfer)
**Trường bắt buộc:**

| Trường | Kiểu |
|---|---|
| `tuKhoId` | uuid |
| `denKhoId` | uuid |
| `danhSach[]` | [{itemId, soLo, soLuong}] |
| `lyDo` | string |
| `nguoiDuyet` | uuid |

**Actions:**
- [ ] Tạo phiếu điều chuyển
- [ ] Duyệt phiếu điều chuyển
- [ ] Xem lịch sử điều chuyển theo kho

---

### P2-09 | Màn hình Active Sessions & Security Monitor
**Thành phần:**
- [ ] Danh sách phiên đăng nhập đang hoạt động: User, IP, device, thời gian đăng nhập
- [ ] Nút Thu hồi session từ xa (Revoke)
- [ ] Log đăng nhập thất bại (brute-force detection): IP, thời gian, username thử
- [ ] Cảnh báo khi phát hiện > N lần thất bại từ cùng IP trong 10 phút

---

### P2-10 | Màn hình Health Check & System Status
**Thành phần:**
- [ ] Status card cho từng dịch vụ: API Server, Database (SQL Server), Redis Cache, Message Queue (RabbitMQ), AI Service
- [ ] Trạng thái: UP (xanh) / DEGRADED (vàng) / DOWN (đỏ)
- [ ] Thời gian uptime
- [ ] Response time p95 của từng dịch vụ
- [ ] Số lượng Background jobs đang chạy / pending / failed
- [ ] Refresh tự động mỗi 30 giây

---

## TỔNG HỢP SỐ LƯỢNG MÀN HÌNH CẦN TẠO MỚI

| Ưu tiên | Số màn hình mới | Ghi chú |
|:---:|:---:|---|
| **P0** | **7** | Bắt buộc trước go-live; thiếu = không vận hành được |
| **P1** | **10** | Cần có trong tháng đầu vận hành |
| **P2** | **10** | Triển khai sau khi P0+P1 ổn định |
| **Tổng** | **27** | Chưa kể bổ sung trường vào màn hình hiện có |

---

*© 2026 – Checklist màn hình AdminUI HIS – ClinicManagement*
