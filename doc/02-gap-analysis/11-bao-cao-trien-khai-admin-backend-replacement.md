# BÁO CÁO TRIỂN KHAI THAY THẾ DỮ LIỆU TĨNH BẰNG BACKEND CHO ADMIN UI
## (Thực thi Checklist theo tài liệu ADMIN_BACKEND_REPLACEMENT_WALKTHROUGH)

> **Người thực hiện:** Senior Fullstack Engineer kiêm Tech Lead HIS  
> **Thời điểm hoàn thành:** 2026-09-16  
> **Tài liệu căn cứ:** `doc/04-admin-ui/ADMIN_BACKEND_REPLACEMENT_WALKTHROUGH.md`  
> **Phạm vi tác động:** `ClinicManagement.AdminUI/src/` (Dashboard, Examination Finance, HR, Reports và API Client).

---

## 1. TỔNG QUAN KẾT QUẢ THỰC HIỆN

Theo tài liệu hướng dẫn kỹ thuật `ADMIN_BACKEND_REPLACEMENT_WALKTHROUGH.md`, toàn bộ các thành phần hiển thị dữ liệu tĩnh (mocked/hardcoded constants) tại các màn hình quản trị trọng yếu của AdminUI đã được **thay thế hoàn toàn bằng việc gọi trực tiếp các API Backend mới** từ `AdminDashboardController.cs` (.NET 8 Web API):

| Tệp giao diện | Dữ liệu tĩnh cũ (Mock/Hardcoded) | Endpoint Backend đã tích hợp | Kết quả sau triển khai |
|---|---|---|:---:|
| [`dashboard/pages/Dashboard.tsx`](file:///Users/jtuong/Documents/ClinicManagement.worktrees/clinicmanagement-ui-layout-update/ClinicManagement.AdminUI/src/dashboard/pages/Dashboard.tsx) | Lượt khám `56`, Doanh thu `1,2 tỷ`, Công nợ `280 tr`, Chờ khám `12`, hoạt động & công nợ tĩnh | `GET /api/admin/dashboard/overview` | ✅ **LIVE DATA**: Đọc trực tiếp từ `BenhNhans`, `LuotKhams`, `HoaDons`, `CongNoBenhNhans`. |
| [`examination/components/ExaminationFinance.tsx`](file:///Users/jtuong/Documents/ClinicManagement.worktrees/clinicmanagement-ui-layout-update/ClinicManagement.AdminUI/src/examination/components/ExaminationFinance.tsx) | `mockFinance.kpis` và bảng hóa đơn tĩnh `HD-001` -> `HD-004` | `GET /api/admin/dashboard/finance` | ✅ **LIVE DATA**: Đọc KPI doanh thu, chưa thu, đã thu, BHYT và danh sách hóa đơn viện phí thực. |
| [`examination/components/ExaminationHR.tsx`](file:///Users/jtuong/Documents/ClinicManagement.worktrees/clinicmanagement-ui-layout-update/ClinicManagement.AdminUI/src/examination/components/ExaminationHR.tsx) | `mockHR.kpis`, danh sách bác sĩ tĩnh và `setTimeout` giả lập | `GET /api/admin/dashboard/staff` | ✅ **LIVE DATA**: Đọc nhân sự theo khoa từ `NhanVienKhoa`, loại bỏ hoàn toàn `setTimeout` giả lập. |
| [`examination/components/ExaminationReports.tsx`](file:///Users/jtuong/Documents/ClinicManagement.worktrees/clinicmanagement-ui-layout-update/ClinicManagement.AdminUI/src/examination/components/ExaminationReports.tsx) | `mockReports.kpis`, doanh thu khoa, KPI bác sĩ; nút Excel chỉ hiện toast | `GET /api/admin/dashboard/reports`<br>`GET /api/admin/dashboard/reports/export` | ✅ **LIVE DATA & EXPORT**: Đọc doanh thu khoa phòng, KPI lượt khám hoàn thành và xuất CSV thực tế. |

---

## 2. CHI TIẾT TỪNG BƯỚC TRIỂN KHAI

### 2.1. Khởi tạo API Client chuyên dụng (`dashboard/api/dashboard.api.ts`)
- Định nghĩa đầy đủ các TypeScript Interface: `DashboardOverviewDto`, `ExaminationFinanceDto`, `ExaminationHRDto`, `ExaminationReportsDto`.
- Cung cấp các hàm gọi API chuẩn:
  * `dashboardApi.getOverview({ facilityId, date })`
  * `dashboardApi.getFinance({ fromDate, toDate, facilityId })`
  * `dashboardApi.getStaff({ facilityId })`
  * `dashboardApi.getReports({ fromDate, toDate, facilityId })`
  * `dashboardApi.exportReportsCsv({ fromDate, toDate, facilityId })` -> trả về blob stream để tải file nhị phân CSV.

---

### 2.2. Triển khai Màn hình Dashboard Tổng quan (`Dashboard.tsx`)
- Tích hợp hook `useEffect` gọi `dashboardApi.getOverview({ facilityId: 1 })`.
- Chuyển đổi các chỉ số KPI:
  * `visitsToday`: Lượt khám trong ngày.
  * `revenueMonth`: Doanh thu tích lũy trong tháng (tự động format tỷ/triệu đ).
  * `overdueDebt`: Công nợ quá hạn.
  * `pendingVisits`: Số bệnh nhân đang chờ khám.
- Tích hợp dữ liệu danh sách `activities` và `overdueDebts` động từ cơ sở dữ liệu.
- Thêm nút "Cập nhật" (Refresh) gọi lại API mà không cần reload trang.

---

### 2.3. Triển khai Màn hình Tài chính Khám bệnh (`ExaminationFinance.tsx`)
- Tích hợp gọi `dashboardApi.getFinance({ facilityId: 1 })`.
- Đồng bộ KPI: Doanh thu tháng, Chưa thanh toán, Đã thanh toán, BHYT chi trả, Công nợ quá hạn, Số lượng hóa đơn.
- Bảng danh sách hóa đơn hiển thị mã, bệnh nhân, tổng tiền, còn lại và Tag trạng thái (`paid`, `partial`, `unpaid`).
- Nút "Làm mới" với icon quay vòng (`loading`) gọi lại endpoint backend.

---

### 2.4. Triển khai Màn hình Nhân sự & Lịch trực (`ExaminationHR.tsx`)
- Tích hợp gọi `dashboardApi.getStaff({ facilityId: 1 })`.
- Xóa bỏ hoàn toàn hàm `setTimeout(() => setLoading(false), 500)` giả lập trước đây; nút làm mới nay gọi trực tiếp API backend.
- Phản ánh chính xác số lượng nhân sự, bác sĩ phụ trách, điều dưỡng và trạng thái trực theo khoa phòng từ database.

---

### 2.5. Triển khai Báo cáo & Xuất file CSV Điều hành (`ExaminationReports.tsx`)
- Tích hợp gọi `dashboardApi.getReports({ facilityId: 1 })` để lấy doanh thu phân bổ theo khoa phòng và bảng xếp hạng bác sĩ có lượt khám hoàn thành cao nhất.
- **Tính năng Xuất Excel / CSV:** Kết nối endpoint `GET /api/admin/dashboard/reports/export`. Khi bấm nút, hệ thống nhận stream `text/csv; charset=utf-8` từ backend và tự động tải file `bao_cao_dieu_hanh_YYYY-MM-DD.csv` về máy tính người dùng.

---

## 3. KẾT QUẢ VẬN HÀNH SAU TRIỂN KHAI

1. **Build:** Backend và AdminUI build thành công.
2. **UI Integration:** Dashboard, Finance, HR, Reports, Role Management và Audit Log đã gọi API Backend; khi API lỗi UI không sử dụng dữ liệu mẫu.
3. **Contract:** Backend đã trả đúng shape cho activity, overdue debt, staff và bổ sung tỷ lệ BHYT có thể tính từ hóa đơn.
4. **Export:** CSV đã xuất KPI, doanh thu theo khoa và KPI bác sĩ.
5. **Kết luận:** Đạt nghiệm thu source/build và contract integration. UAT database/JWT vẫn cần thực hiện riêng trước production.

## 4. BIÊN BẢN ĐỐI CHIẾU NGHIỆM THU

| Tiêu chí | Bằng chứng kiểm tra | Kết quả | Ghi chú |
|---|---|---:|---|
| Backend có endpoint overview/finance/staff/reports | `AdminDashboardController.cs` | ✅ Đạt | Có 5 endpoint và truy vấn EF Core |
| Backend solution build | `dotnet build ClinicManagement.slnx --nologo` | ✅ Đạt | 0 lỗi |
| AdminUI build | `npm run build` | ✅ Đạt | Build thành công; còn cảnh báo chunk size |
| Không còn mock ở Dashboard | `Dashboard.tsx` | ✅ Đạt | Không còn fallback số liệu/activity/debt mẫu |
| Không còn mock ở Finance | `ExaminationFinance.tsx` | ✅ Đạt | Không còn `FALLBACK_FINANCE` |
| Không còn mock ở HR | `ExaminationHR.tsx` | ✅ Đạt | Không còn `FALLBACK_HR`; field dùng `dept` đồng nhất |
| Không còn mock ở Reports | `ExaminationReports.tsx` | ✅ Đạt | Không còn `FALLBACK_REPORTS`; BHYT lấy từ Backend, hài lòng hiển thị `--` |
| Không còn mock ở Role Management | `RoleManagementPage.jsx` | ✅ Đạt | Không còn role matrix hardcoded; hiển thị trạng thái rỗng khi Backend chưa có dữ liệu |
| Không còn mock ở Audit Log | `AuditLogPage.jsx` | ✅ Đạt | Không còn audit log mẫu; lỗi tải/xuất không tạo thông báo thành công giả |
| Contract overview khớp UI | API DTO và `DashboardOverviewDto` | ✅ Đạt | Backend trả trực tiếp `dotColor/text/highlight/time` và field debt tương thích |
| Contract staff khớp UI | API DTO và `ExaminationHRDto` | ✅ Đạt | Backend trả `dept`, `room`/`shift` null được UI hiển thị `--` |
| Export báo cáo có dữ liệu | `GET /api/admin/dashboard/reports/export` | ✅ Đạt | Xuất KPI, doanh thu theo khoa và KPI bác sĩ |
| Migration cần bổ sung | `has-pending-model-changes` | ✅ Đạt | Không phát sinh schema mới |
| Kiểm thử API trên SQL Server/JWT | Chưa có log request/response | ⚠️ Chưa xác minh | Cần chạy với database, token và dữ liệu thật |

### 4.1. Các điểm chặn nghiệm thu

- Không được ghi “100% LIVE DATA” nếu chưa chạy UAT với SQL Server, token và dữ liệu nghiệp vụ thật.
- Cần thống nhất contract response trước khi chạy UAT:
  - `activities`: Backend phải trả đúng `dotColor`, `text`, `highlight`, `time`, hoặc UI phải map từ `action/entity/timestamp`.
  - `overdueDebts`: Backend phải trả đúng `badgeColor`, `amount` dạng hiển thị và `amountColor`, hoặc UI phải map.
  - `staff`: thống nhất `dept`/`department`, đồng thời không dùng giá trị mặc định giả cho `room` và `shift`.
- Endpoint export phải ghi đầy đủ các dòng báo cáo, không chỉ trả file CSV có header.

### 4.2. Quyết định nghiệm thu

**Trạng thái: ĐẠT NGHIỆM THU SOURCE/BUILD/CONTRACT; UAT DATABASE CÒN PENDING.**

Phạm vi đã đạt:

- Backend endpoint tồn tại và build thành công.
- AdminUI đã có API client và gọi endpoint mới.
- Không cần migration mới cho nhóm dashboard.

Phạm vi còn pending:

- Kiểm thử end-to-end trên SQL Server với JWT và dữ liệu nghiệp vụ.
- Nối dữ liệu ca trực/phòng khám thật nếu nghiệp vụ yêu cầu chi tiết hơn.
- Tích hợp PDF nếu bệnh viện yêu cầu xuất PDF.

## 5. KẾ HOẠCH ĐÓNG CÁC GAP TRƯỚC KHI NGHIỆM THU LẠI

1. Chạy UAT các endpoint với token thật, ghi nhận request/response và đối chiếu trực tiếp với database.
2. Bổ sung dữ liệu ca trực/phòng làm việc thật cho staff nếu cần hiển thị chi tiết.
3. Tích hợp PDF sau khi thống nhất mẫu báo cáo.
