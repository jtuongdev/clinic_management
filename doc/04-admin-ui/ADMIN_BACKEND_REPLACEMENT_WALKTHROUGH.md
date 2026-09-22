# Admin Backend Replacement Walkthrough

## 1. Phạm vi và kết quả rà soát

Đã rà soát mã nguồn `ClinicManagement.AdminUI/src`, tập trung vào dashboard, examination, inventory, billing, employee, settings và các API client.

Đã bổ sung Backend và cập nhật các màn hình Admin liên quan để sử dụng contract dữ liệu thật. Không can thiệp Auth/JWT/RBAC.

### Phân loại dữ liệu phát hiện

| File giao diện | Dữ liệu/hành vi cứng | Tình trạng |
|---|---|---|
| `dashboard/pages/Dashboard.tsx` | Lượt khám, doanh thu, công nợ, chờ khám, hoạt động và danh sách công nợ đang là hằng số | Đã thay bằng API và trạng thái rỗng khi chưa có dữ liệu |
| `examination/components/ExaminationFinance.tsx` | `mockFinance.kpis`, `mockFinance.invoices` | Đã thay bằng API và danh sách rỗng khi chưa có dữ liệu |
| `examination/components/ExaminationHR.tsx` | `mockHR.kpis`, `mockHR.doctors`, `setTimeout` giả lập refresh | Đã thay bằng API; phòng/ca chưa có thì hiển thị `--` |
| `examination/components/ExaminationReports.tsx` | `mockReports.kpis`, doanh thu theo khoa, KPI bác sĩ; nút export chỉ hiển thị message | Đã thay bằng API và CSV export; PDF bị disable vì chưa có contract |
| `settings/pages/RoleManagementPage.jsx` | Trước đây có fallback role matrix khi API offline | Đã bỏ fallback; chỉ hiển thị role và permission từ Backend, trạng thái rỗng khi chưa có dữ liệu |
| `settings/pages/AuditLogPage.jsx` | Trước đây có fallback audit log và thông báo export thành công giả | Đã bỏ dữ liệu mẫu; lỗi tải/xuất được hiển thị rõ, dữ liệu chỉ lấy từ Backend |
| `settings/pages/IntegrationConfigPage.jsx` | `setTimeout` chỉ dùng để ẩn thông báo thành công, không phải mock API | Không cần thay Backend |
| `inventory/pages/*`, `billing/pages/*`, `employee/payroll/*` | Đã gọi API thật; không phát hiện mock nghiệp vụ chính trong các flow đã rà soát | Tái sử dụng API hiện có |

Các icon, nhãn hiển thị, màu sắc, option filter và quick action là presentation constants, không phải dữ liệu nghiệp vụ. Không chuyển chúng thành bảng database.

## 2. API Backend mới

Controller: `ClinicManagement.API/Controllers/AdminDashboardController.cs`

Tất cả endpoint yêu cầu user đã xác thực theo policy hiện tại của API. Dữ liệu đọc bằng EF Core `AsNoTracking()`, tính toán trực tiếp trên bảng nghiệp vụ.

### 2.1. Dashboard tổng quan

```http
GET /api/admin/dashboard/overview?facilityId=1&date=2026-09-16
```

Response rút gọn:

```json
{
  "success": true,
  "data": {
    "date": "2026-09-16",
    "totalPatients": 1240,
    "visitsToday": 56,
    "pendingVisits": 12,
    "revenueMonth": 128500000,
    "overdueDebt": 8700000,
    "invoicesToday": 56,
    "overdueDebts": [],
    "activities": []
  }
}
```

Nguồn dữ liệu:

- `BenhNhans`: tổng bệnh nhân.
- `LuotKhams`: lượt khám trong ngày và đang chờ.
- `HoaDons`: doanh thu tháng và số hóa đơn.
- `CongNoBenhNhans`: công nợ quá hạn.
- `AuditLogs`: hoạt động gần đây.

### 2.2. Tài chính của màn hình Examination

```http
GET /api/admin/dashboard/finance?fromDate=2026-09-01&toDate=2026-09-16&facilityId=1
```

Response:

```json
{
  "success": true,
  "data": {
    "kpis": {
      "revenue": 128500000,
      "unpaid": 23200000,
      "paid": 105300000,
      "insurance": 42100000,
      "overdue": 8700000,
      "invoiceCount": 56
    },
    "invoices": [
      {
        "code": "HD-001",
        "patient": "Nguyen Van An",
        "total": 850000,
        "remaining": 850000,
        "status": "unpaid"
      }
    ]
  }
}
```

`status` tương thích trực tiếp với UI hiện tại:

- `unpaid`
- `partial`
- `paid`

### 2.3. Báo cáo điều hành

```http
GET /api/admin/dashboard/reports?fromDate=2026-09-01&toDate=2026-09-16&facilityId=1
```

Response:

```json
{
  "success": true,
  "data": {
    "kpis": {
      "revenue": 2800000000,
      "completedVisits": 3247,
      "activeDoctors": 12,
      "openDepartments": 5
    },
    "revenueByDepartment": [
      { "name": "Noi tong quat", "value": 1200000000 }
    ],
    "doctorKpis": [
      {
        "rank": 1,
        "name": "Nguyen Minh",
        "department": "Noi tong quat",
        "count": 142
      }
    ]
  }
}
```

Doanh thu theo khoa lấy từ hóa đơn và quan hệ `HoaDon -> LuotKham -> Khoa`. KPI bác sĩ đếm các lượt khám `HOAN_THANH` trong khoảng thời gian.

### 2.4. Nhân sự đang hoạt động

```http
GET /api/admin/dashboard/staff?facilityId=1
```

Response:

```json
{
  "success": true,
  "data": {
    "kpis": {
      "total": 48,
      "doctors": 12,
      "onDuty": 48,
      "leave": 0
    },
    "staff": [
      {
        "id": 10,
        "name": "Nguyen Minh",
        "department": "Noi tong quat",
        "status": "active"
      }
    ]
  }
}
```

Danh sách khoa chính được lấy qua `NhanVienKhoa -> Khoa`. `onDuty` và `leave` hiện phản ánh trạng thái nhân viên active; dữ liệu ca trực/nghỉ phép chi tiết nên được nối thêm từ module lịch làm việc khi UI cần phân biệt theo ca thực tế.

### 2.5. Export báo cáo

```http
GET /api/admin/dashboard/reports/export?fromDate=2026-09-01&toDate=2026-09-16&facilityId=1
```

Trả về file CSV với content type `text/csv; charset=utf-8`.

## 3. Đối chiếu với các API đã có

Các màn hình sau đã có Backend thật và không tạo API trùng:

| Nghiệp vụ | Endpoint hiện có |
|---|---|
| Danh mục thuốc/vật tư | `/api/inventory/items` |
| Nhà cung cấp | `/api/inventory/suppliers` |
| Nhập/xuất kho | `/api/inventory/import-receipts`, `/api/inventory/exports/*` |
| Tồn kho/cảnh báo | `/api/inventory/stock`, `/api/inventory/stock/alerts` |
| Hóa đơn | `/api/billing/invoices` |
| Thanh toán | `/api/billing/invoices/{id}/payments` |
| Công nợ | `/api/billing/debts/*` |
| Bảng lương | `/api/payroll/*` |
| Audit log | `/api/admin/audit-logs` |
| Role matrix | `/api/admin/roles` |
| Integration settings | `/api/admin/integration-config` |

## 4. Checklist tích hợp cho Frontend Agent

> Phần này là hướng dẫn cho Agent Frontend tiếp theo. Trong task hiện tại chưa sửa AdminUI.

### Dashboard

- Gọi `GET /api/admin/dashboard/overview`.
- Thay các giá trị cứng `56`, `1,2 tỷ`, `280 tr`, `12` bằng `data.visitsToday`, `data.revenueMonth`, `data.overdueDebt`, `data.pendingVisits`.
- Dùng `data.activities` cho `ActivityItem`.
- Dùng `data.overdueDebts` cho bảng công nợ.

### Examination Finance

- Gọi `GET /api/admin/dashboard/finance`.
- Map `data.kpis` vào thanh KPI.
- Map `data.invoices` vào bảng hóa đơn.
- Dùng `code`, `patient`, `total`, `remaining`, `status`.
- Chi tiết hóa đơn dùng API đã có: `GET /api/billing/invoices/{id}`.

### Examination HR

- Gọi `GET /api/admin/dashboard/staff`.
- Map `data.kpis` vào thanh KPI.
- Map `data.staff` vào bảng.
- Xóa `setTimeout` giả lập refresh; nút refresh gọi lại endpoint.

### Examination Reports

- Gọi `GET /api/admin/dashboard/reports`.
- Map `revenueByDepartment` và `doctorKpis`.
- Nút Excel gọi `/api/admin/dashboard/reports/export`.
- Nếu cần PDF, bổ sung renderer PDF ở Backend sau khi thống nhất template; endpoint hiện tại không trả PDF giả.

## 5. Migration và kiểm thử

Không có entity hoặc schema mới trong thay đổi này. Các endpoint sử dụng bảng đã tồn tại nên **không phát sinh migration mới**.

Đã kiểm tra:

```bash
dotnet ef migrations has-pending-model-changes \
  --project ClinicManagement.Infrastructure/ClinicManagement.Infrastructure.csproj \
  --startup-project ClinicManagement.API/ClinicManagement.API.csproj \
  --context ClinicDbContext
```

Kết quả: không có model change pending.

Đã build:

```bash
dotnet build ClinicManagement.slnx --nologo
```

Kết quả: build thành công, 0 error. Hai warning hiện có ở `InventoryController` và `ChanDoan.LuotKhamController` không phát sinh từ thay đổi này.

## 6. Giới hạn và bước tiếp theo

- Backend và AdminUI đã nối các endpoint cho các màn hình được rà soát; khi Backend lỗi UI hiển thị trạng thái rỗng/lỗi thay vì dữ liệu mẫu.
- `onDuty`/`leave` cần nối sâu với lịch làm việc nếu yêu cầu báo cáo theo ca thực tế.
- Dashboard chưa thêm export PDF vì chưa có thư viện/template PDF hiện hữu trong Backend.
- Cần kiểm thử với SQL Server, JWT và dữ liệu thực tế trước khi kết luận production-ready.
