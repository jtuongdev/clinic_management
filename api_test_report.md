# Báo Cáo Kiểm Thử Toàn Bộ API (Method: GET)

Báo cáo dưới đây liệt kê trạng thái của tất cả các API GET trong hệ thống khi được gọi với token mới nhất của `admin.test`.


### ✅ /
- **URL Test:** `/`
- **Status:** `200`
- **Response:**
```json
Clinic Management API is running. Go to /scalar/v1 for API documentation.
```

### ❌ /api/admin/dashboard/overview
- **URL Test:** `/api/admin/dashboard/overview`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: The LINQ expression 'DbSet<CongNoBenhNhan>()
    .Where(c => c.IsDeleted == False)
    .Where(c => (int)c.TrangThai == 3)
    .OrderByDescending(c => c.SoTienConLai)' could not be translated. Additional information: Translation of member 'SoTienConLai' on entity type 'CongNoBenhNhan' failed. This commonly occurs when the specified member is unmapped. Either rewrite the query in a form that can be translated, or switch to client evaluation explicitly by inserting...
```

### ❌ /api/admin/dashboard/finance
- **URL Test:** `/api/admin/dashboard/finance`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: The LINQ expression 'DbSet<CongNoBenhNhan>()
    .Where(c => c.IsDeleted == False)
    .Where(c => (int)c.TrangThai == 3)
    .Sum(c => (decimal?)c.SoTienConLai)' could not be translated. Additional information: Translation of member 'SoTienConLai' on entity type 'CongNoBenhNhan' failed. This commonly occurs when the specified member is unmapped. Either rewrite the query in a form that can be translated, or switch to client evaluation explicitly by inserting a c...
```

### ✅ /api/admin/dashboard/reports
- **URL Test:** `/api/admin/dashboard/reports`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"kpis": {"revenue": 400000.0, "completedVisits": 2, "activeDoctors": 3, "openDepartments": 3, "bhytReimbursementRate": 55.17}, "revenueByDepartment": [{"name": "Khoa Nội test", "value": 400000.0}], "doctorKpis": [{"rank": 1, "name": "Bác Sĩ Test", "department": "Khoa Nội test", "count": 1}]}}
```

### ✅ /api/admin/dashboard/staff
- **URL Test:** `/api/admin/dashboard/staff`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"kpis": {"total": 3, "doctors": 3, "onDuty": 3, "leave": 0}, "staff": [{"id": 5, "name": "Admin Test", "dept": "Quản trị hệ thống", "room": null, "shift": null, "status": "active"}, {"id": 6, "name": "Bác Sĩ Test", "dept": "Khoa Nội test", "room": null, "shift": null, "status": "active"}, {"id": 7, "name": "Thu Ngân Test", "dept": "Tài chính kế toán", "room": null, "shift": null, "status": "active"}]}}
```

### ✅ /api/admin/dashboard/reports/export
- **URL Test:** `/api/admin/dashboard/reports/export`
- **Status:** `200`
- **Response:**
```json
Loai,Ten,ChiTiet,SoLuong,GiaTri
KPI,"Doanh thu","2026-09-01T00:00:00.0000000 - 2026-09-18T00:00:00.0000000Z",2,400000.00
DoanhThuKhoa,"Khoa Nội test",,,400000.00
KPIBacSi,"Bác Sĩ Test","Khoa Nội test",1,

```

### ✅ /api/admin/roles
- **URL Test:** `/api/admin/roles`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"id": 3, "code": "ADMIN_TEST", "name": "ADMIN_TEST", "description": "Ma tran quyen luu trong co so du lieu", "dataScope": "ALL_FACILITIES", "permissions": {"audit": ["CREATE", "VIEW"], "billing": ["APPROVE", "VIEW"], "examination": ["CREATE", "VIEW"], "inventory": ["APPROVE", "VIEW"], "patient": ["VIEW"], "settings": ["EDIT", "VIEW"]}}]}
```

### ✅ /api/admin/audit-logs
- **URL Test:** `/api/admin/audit-logs`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"id": 4, "patientId": 5, "recordId": 2, "userId": 5, "action": "EXPORT", "module": "EMR", "ipAddress": "127.0.0.1", "timestamp": "2026-09-16T09:50:00", "details": "Test xuat file CSV ho so benh an", "status": "WARNING"}, {"id": 2, "patientId": 6, "recordId": 3, "userId": 6, "action": "SIGN", "module": "EMR", "ipAddress": "127.0.0.1", "timestamp": "2026-09-16T09:45:00", "details": "Khoa ho so test sau khi hoan tat kham", "status": "SUCCESS"}, {...
```

### ✅ /api/admin/audit-logs/export
- **URL Test:** `/api/admin/audit-logs/export`
- **Status:** `200`
- **Response:**
```json
Id,PatientId,RecordId,UserId,Action,Module,IpAddress,Timestamp,Status,Details
4,5,2,5,"EXPORT","EMR","127.0.0.1",2026-09-16T09:50:00.0000000,"WARNING","Test xuat file CSV ho so benh an"
2,6,3,6,"SIGN","EMR","127.0.0.1",2026-09-16T09:45:00.0000000,"SUCCESS","Khoa ho so test sau khi hoan tat kham"
1,6,3,6,"VIEW","EMR","127.0.0.1",2026-09-16T09:05:00.0000000,"SUCCESS","Test VIEW ho so cap cuu"
3,5,2,6,"PRESCRIBE","EMR","127.0.0.1",2026-09-16T08:40:00.0000000,"SUCCESS","Ke don thuoc Paracetamol"

```

### ✅ /api/admin/integration-config
- **URL Test:** `/api/admin/integration-config`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"id": 6, "category": "BHYT", "code": "FACILITY_CODE", "name": "Mã cơ sở KCB", "value": "TEST-CSKCB", "description": null, "isEncrypted": false, "updatedBy": null, "updatedAt": "2026-09-16T00:00:00"}, {"id": 7, "category": "BHYT", "code": "FORMAT", "name": "Định dạng gói tin BHYT", "value": "4210", "description": null, "isEncrypted": false, "updatedBy": null, "updatedAt": "2026-09-16T00:00:00"}, {"id": 1, "category": "LIS", "code": "ENCODING", ...
```

### ✅ /api/Auth/me
- **URL Test:** `/api/Auth/me`
- **Status:** `200`
- **Response:**
```json
{"success": true, "data": {"userId": 5, "userName": "admin.test", "fullName": "Admin Test", "email": "admin@example.local", "roles": ["ADMIN_TEST"], "isAuthenticated": true}}
```

### ✅ /api/Auth/validate
- **URL Test:** `/api/Auth/validate`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Token hợp lệ"}
```

### ✅ /api/Auth/has-role/{role}
- **URL Test:** `/api/Auth/has-role/1`
- **Status:** `200`
- **Response:**
```json
{"success": true, "role": "1", "hasRole": false}
```

### ✅ /api/BenhNhan/paged
- **URL Test:** `/api/BenhNhan/paged`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 10, "totalCount": 3, "totalPages": 1, "items": [{"id": 6, "ho": "Lê", "ten": "Bảo Hiểm", "hoTen": "Lê Bảo Hiểm", "ngaySinh": "1988-11-10T00:00:00", "gioiTinh": "O", "dienThoai": "0900000030", "email": "bn003@example.local", "soCCCD": "TEST-CCCD-003", "diaChi": "Địa chỉ test 3", "nguoiLienHeTen": "Người liên hệ 3", "nguoiLienHeDienThoai": "0900000093", "createdAt": "2026-09-16T15:00:55.3109088", "isDeleted": false, "m...
```

### ✅ /api/BenhNhan/count/benhnhan/thongke
- **URL Test:** `/api/BenhNhan/count/benhnhan/thongke`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"tongBenhNhan": 3, "dangKham": 1, "choKham": 0, "daHoanThanh": 2, "daHuy": 0}}
```

### ❌ /api/BenhNhan/{id}
- **URL Test:** `/api/BenhNhan/1`
- **Status:** `500`
- **Response:**
```json
System.Collections.Generic.KeyNotFoundException: Không tìm thấy bệnh nhân với Id = 1
   at ClinicManagement.Application.Features.BenhNhan.Queries.GetBenhNhanByIdQueryHandler.Handle(GetBenhNhanByIdQuery request, CancellationToken cancellationToken) in /Users/jtuong/Documents/ClinicManagement.worktrees/clinicmanagement-ui-layout-update/ClinicManagement.Application/Features/BenhNhan/Queries/GetBenhNhanById/GetBenhNhanByIdQueryHandler.cs:line 25
   at ClinicManagement.API.Controllers.BenhNhanControl...
```

### ✅ /api/BenhNhan/search
- **URL Test:** `/api/BenhNhan/search`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"id": 4, "ho": "Nguyễn", "ten": "Test Một", "hoTen": "Nguyễn Test Một", "ngaySinh": "1995-05-20T00:00:00", "gioiTinh": "O", "dienThoai": "0900000010", "email": "bn001@example.local", "soCCCD": "TEST-CCCD-001", "diaChi": "Địa chỉ test 1", "nguoiLienHeTen": "Người liên hệ 1", "nguoiLienHeDienThoai": "0900000091", "createdAt": "2026-09-16T15:00:55.3049032", "isDeleted": false, "maBenhNhanNoiBo": "", "maCoSo": 0, "tenCoSo": "", "tenKhoa": "", "tra...
```

### ✅ /api/BenhNhan/filter-by-date
- **URL Test:** `/api/BenhNhan/filter-by-date`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/BenhNhan/deleted
- **URL Test:** `/api/BenhNhan/deleted`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/BenhNhan/{id}/tiensu
- **URL Test:** `/api/BenhNhan/1/tiensu`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/BenhNhan/{id}/tiensu/latest
- **URL Test:** `/api/BenhNhan/1/tiensu/latest`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": null}
```

### ✅ /api/BenhNhan/loai-tien-su
- **URL Test:** `/api/BenhNhan/loai-tien-su`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"value": "BENH_NEN", "label": "Bệnh nền", "description": "Thông tin bệnh nền của bệnh nhân"}, {"value": "DI_UNG", "label": "Dị ứng", "description": "Thông tin dị ứng thuốc hoặc thức ăn"}, {"value": "PHAU_THUAT", "label": "Phẫu thuật", "description": "Lịch sử phẫu thuật"}, {"value": "TIEN_SU_GIA_DINH", "label": "Tiền sử gia đình", "description": "Tiền sử bệnh trong gia đình"}, {"value": "THOI_QUEN_SINH_HOAT", "label": "Thói quen sinh hoạt", "de...
```

### ❌ /api/BenhNhan/{id}/profile
- **URL Test:** `/api/BenhNhan/1/profile`
- **Status:** `500`
- **Response:**
```json
System.Collections.Generic.KeyNotFoundException: Không tìm thấy bệnh nhân với Id = 1
   at ClinicManagement.Application.Features.BenhNhan.Queries.GetBenhNhanProfileQueryHandler.Handle(GetBenhNhanProfileQuery request, CancellationToken cancellationToken) in /Users/jtuong/Documents/ClinicManagement.worktrees/clinicmanagement-ui-layout-update/ClinicManagement.Application/Features/BenhNhan/Queries/GetBenhNhanProfileQuery/GetBenhNhanProfileQueryHandler.cs:line 27
   at ClinicManagement.API.Controller...
```

### ✅ /api/BenhNhan/{id}/visits
- **URL Test:** `/api/BenhNhan/1/visits`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 10, "totalCount": 0, "totalPages": 0, "items": [], "hasPreviousPage": true, "hasNextPage": false}}
```

### ✅ /api/BenhNhan/{id}/prescriptions
- **URL Test:** `/api/BenhNhan/1/prescriptions`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 10, "totalCount": 0, "totalPages": 0, "items": [], "hasPreviousPage": true, "hasNextPage": false}}
```

### ✅ /api/BenhNhan/{id}/lab-results
- **URL Test:** `/api/BenhNhan/1/lab-results`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 10, "totalCount": 0, "totalPages": 0, "items": [], "hasPreviousPage": true, "hasNextPage": false}}
```

### ✅ /api/BenhNhan/{id}/invoices
- **URL Test:** `/api/BenhNhan/1/invoices`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 10, "totalCount": 0, "totalPages": 0, "items": [], "hasPreviousPage": true, "hasNextPage": false}}
```

### ❌ /api/billing/invoices
- **URL Test:** `/api/billing/invoices`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'UNPAID' from the database to any value in the mapped 'TrangThaiHoaDon' enum.
   at lambda_method1633(Closure, String)
   at lambda_method1609(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`...
```

### ❌ /api/billing/invoices/{id}
- **URL Test:** `/api/billing/invoices/1`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'PAID' from the database to any value in the mapped 'TrangThaiHoaDon' enum.
   at lambda_method1633(Closure, String)
   at lambda_method1748(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAsync[TSou...
```

### ❌ /api/billing/invoices/by-visit/{visitId}
- **URL Test:** `/api/billing/invoices/by-visit/1`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'UNPAID' from the database to any value in the mapped 'TrangThaiHoaDon' enum.
   at lambda_method1633(Closure, String)
   at lambda_method1870(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAsync[TS...
```

### ❌ /api/billing/invoices/{id}/payments
- **URL Test:** `/api/billing/invoices/1/payments`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'PAID' from the database to any value in the mapped 'TrangThaiHoaDon' enum.
   at lambda_method1633(Closure, String)
   at lambda_method1748(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAsync[TSou...
```

### ✅ /api/billing/debts/by-patient/{patientId}
- **URL Test:** `/api/billing/debts/by-patient/1`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ❌ /api/billing/debts/overdue
- **URL Test:** `/api/billing/debts/overdue`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'PARTIAL' from the database to any value in the mapped 'TrangThaiHoaDon' enum.
   at lambda_method1633(Closure, String)
   at lambda_method1942(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable...
```

### ✅ /api/CaTruc
- **URL Test:** `/api/CaTruc`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/ChamCong
- **URL Test:** `/api/ChamCong`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/ChamCong/kpi-summary
- **URL Test:** `/api/ChamCong/kpi-summary`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"fromDate": "0001-01-01T00:00:00", "toDate": "0001-01-01T00:00:00", "maKhoa": null, "maNhanVien": null, "tongLich": 0, "lichLamViec": 0, "lichNghi": 0, "lichHuy": 0, "tongChamCong": 0, "daCheckIn": 0, "daCheckOut": 0, "thieuCheckOut": 0, "choXacNhan": 0, "vangMat": 0, "nghiPhep": 0, "diDungGio": 0, "diMuon": 0, "tongGioLam": 0}}
```

### ✅ /api/ChamCong/adjustments
- **URL Test:** `/api/ChamCong/adjustments`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/ChamCong/periods
- **URL Test:** `/api/ChamCong/periods`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ❌ /api/clinical/transactions/{visitId}/summary
- **URL Test:** `/api/clinical/transactions/1/summary`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'BENH_VIEN' from the database to any value in the mapped 'LoaiCoSo' enum.
   at lambda_method3192(Closure, String)
   at lambda_method2645(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAsync[TSourc...
```

### ✅ /api/CoSo/dropdown
- **URL Test:** `/api/CoSo/dropdown`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Lấy danh sách cơ sở thành công", "data": [{"id": 3, "ma": "CS-TEST", "ten": "Cơ sở test ClinicManagement"}]}
```

### ✅ /api/EnumCatalog/schedule-statuses
- **URL Test:** `/api/EnumCatalog/schedule-statuses`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"code": "LAM_VIEC", "label": "Làm việc"}, {"code": "NGHI", "label": "Nghỉ trong ngày"}, {"code": "HUY", "label": "Đã hủy"}]}
```

### ✅ /api/EnumCatalog/attendance-statuses
- **URL Test:** `/api/EnumCatalog/attendance-statuses`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"code": "CHUA_CHAM_CONG", "label": "Chưa chấm công"}, {"code": "DI_DUNG_GIO", "label": "Đúng giờ"}, {"code": "DI_MUON", "label": "Đi muộn"}, {"code": "VE_SOM", "label": "Về sớm"}, {"code": "DI_MUON_VE_SOM", "label": "Đi muộn và về sớm"}, {"code": "NGHI_PHEP", "label": "Nghỉ phép"}, {"code": "VANG_MAT", "label": "Vắng mặt"}, {"code": "THIEU_CHECK_OUT", "label": "Thiếu check-out"}, {"code": "CHO_XAC_NHAN", "label": "Chờ xác nhận"}]}
```

### ✅ /api/EnumCatalog/leave-statuses
- **URL Test:** `/api/EnumCatalog/leave-statuses`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"code": "CHO_DUYET", "label": "Chờ duyệt"}, {"code": "DA_DUYET", "label": "Đã duyệt"}, {"code": "TU_CHOI", "label": "Từ chối"}, {"code": "HUY", "label": "Đã hủy"}]}
```

### ✅ /api/inventory/audit-transactions
- **URL Test:** `/api/inventory/audit-transactions`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"data": [], "total": 0}}
```

### ✅ /api/inventory/prescriptions/pending
- **URL Test:** `/api/inventory/prescriptions/pending`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"items": [], "total": 0}}
```

### ✅ /api/inventory/prescriptions/dispensed
- **URL Test:** `/api/inventory/prescriptions/dispensed`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"items": [], "total": 0, "pageIndex": 1, "pageSize": 20}}
```

### ❌ /api/inventory/prescriptions/{prescriptionId}/print-data
- **URL Test:** `/api/inventory/prescriptions/1/print-data`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'HOAN_THANH' from the database to any value in the mapped 'TrangThaiDonThuoc' enum.
   at lambda_method3436(Closure, String)
   at lambda_method3425(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAs...
```

### ✅ /api/inventory/items
- **URL Test:** `/api/inventory/items`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"items": [{"id": 4, "code": "THUOC-AMO-TEST", "name": "Amoxicillin test 500mg", "itemType": "THUOC", "baseUnit": "Viên", "salePrice": 2500.0, "minimumStock": 20.0, "isActive": true, "conversions": []}, {"id": 3, "code": "THUOC-PARA-TEST", "name": "Paracetamol test 500mg", "itemType": "THUOC", "baseUnit": "Viên", "salePrice": 1500.0, "minimumStock": 30.0, "isActive": true, "conversions": []}], "total": 2}}
```

### ✅ /api/inventory/suppliers
- **URL Test:** `/api/inventory/suppliers`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"items": [{"id": 1, "ma": "NCC-TEST", "ten": "Công ty Dược Phẩm Test", "diaChi": "Khu Công Nghiệp Trà Nóc, Cần Thơ", "dienThoai": "02923888999", "email": "ncc@duoctest.vn", "maSoThue": "1800123456", "trangThai": "HoatDong"}], "total": 1, "pageIndex": 1, "pageSize": 20}}
```

### ✅ /api/inventory/import-receipts
- **URL Test:** `/api/inventory/import-receipts`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"items": [{"id": 1, "referenceCode": "PN-TEST-001", "receivedAt": "2026-09-16T07:30:00", "totalAmount": 1000000.0, "status": "HOAN_THANH", "note": "Nhập kho kiểm thử đầu ngày", "facility": {"id": 3, "code": "CS-TEST", "name": "Cơ sở test ClinicManagement"}, "warehouse": {"id": 2, "name": "KHO-DUOC-TEST", "address": "Tầng 1, Khoa Dược"}, "supplier": {"id": 1, "code": "NCC-TEST", "name": "Công ty Dược Phẩm Test", "address": "Khu Công Nghiệp Trà N...
```

### ✅ /api/inventory/stock
- **URL Test:** `/api/inventory/stock`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"items": [{"itemId": 3, "itemCode": "THUOC-PARA-TEST", "itemName": "Paracetamol test 500mg", "baseUnit": "Viên", "minimumStock": 30.0, "totalStock": 0, "batches": [], "isLowStock": true}, {"itemId": 4, "itemCode": "THUOC-AMO-TEST", "itemName": "Amoxicillin test 500mg", "baseUnit": "Viên", "minimumStock": 20.0, "totalStock": 0, "batches": [], "isLowStock": true}], "total": 2}}
```

### ✅ /api/inventory/stock/alerts
- **URL Test:** `/api/inventory/stock/alerts`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/Khoa/dropdown
- **URL Test:** `/api/Khoa/dropdown`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Lấy danh sách khoa thành công", "data": []}
```

### ✅ /api/Khoa/overview
- **URL Test:** `/api/Khoa/overview`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Lấy dữ liệu tổng quan khoa thành công", "data": [{"maKhoa": 7, "tenKhoa": "Khoa Nội test", "tongLuotKham": 3, "soLuotCho": 0, "soBacSi": 0, "trangThai": "BinhThuong"}, {"maKhoa": 8, "tenKhoa": "Khoa Dược test", "tongLuotKham": 0, "soLuotCho": 0, "soBacSi": 0, "trangThai": "BinhThuong"}, {"maKhoa": 9, "tenKhoa": "Khoa Tài chính test", "tongLuotKham": 0, "soLuotCho": 0, "soBacSi": 0, "trangThai": "BinhThuong"}]}
```

### ✅ /api/LichLamViec
- **URL Test:** `/api/LichLamViec`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/LichLamViec/fixed
- **URL Test:** `/api/LichLamViec/fixed`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/LichLamViec/{id}/adjustments
- **URL Test:** `/api/LichLamViec/1/adjustments`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/LoaiCa
- **URL Test:** `/api/LoaiCa`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/LuotKham/benh-nhan/{luotKhamId}/ho-so-dieu-tri
- **URL Test:** `/api/LuotKham/benh-nhan/1/ho-so-dieu-tri`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"id": 1, "maLuotKham": "1", "khoa": "Khoa Nội test", "phong": "", "trangThai": "DANG_KHAM", "hoTen": "Nguyễn Test Một", "maBenhNhanNoiBo": "", "ngaySinh": "20/05/1995", "gioiTinh": "O", "soCCCD": "TEST-CCCD-001", "bhyt": "", "diaChi": "Địa chỉ test 1", "dienThoai": "0900000010"}}
```

### ✅ /api/LuotKham/benh-nhan/{luotKhamId}/thong-tin-benh-nhan
- **URL Test:** `/api/LuotKham/benh-nhan/1/thong-tin-benh-nhan`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"luotKhamId": 1, "maLuotKham": "1", "khoa": "Khoa Nội test", "phong": "", "trangThai": "DANG_KHAM", "hoTen": "Nguyễn Test Một", "maBenhNhanNoiBo": "", "ngaySinh": "20/05/1995", "gioiTinh": "O", "soCCCD": "TEST-CCCD-001", "bhyt": "", "diaChi": "Địa chỉ test 1", "dienThoai": "0900000010"}}
```

### ✅ /api/LuotKham/icd
- **URL Test:** `/api/LuotKham/icd`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"maICD": "I10", "tenICD": "Tăng huyết áp vô căn", "chuong": "Chương IX"}, {"maICD": "J06.9", "tenICD": "Nhiễm trùng đường hô hấp cấp, không đặc hiệu", "chuong": "Chương X"}]}
```

### ✅ /api/LuotKham/{id}/diagnoses
- **URL Test:** `/api/LuotKham/1/diagnoses`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/LuotKham/thong-ke-chi-dinh
- **URL Test:** `/api/LuotKham/thong-ke-chi-dinh`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"tongChiDinh": 0, "dangXuLy": 0, "hoanThanh": 0, "trungBinhTraKetQua": 0}}
```

### ✅ /api/LuotKham/danh-sach-chi-dinh
- **URL Test:** `/api/LuotKham/danh-sach-chi-dinh`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 10, "totalCount": 0, "totalPages": 0, "items": [], "hasPreviousPage": true, "hasNextPage": false}}
```

### ❌ /api/LuotKham/{luotKhamId}/chi-dinh-dich-vu
- **URL Test:** `/api/LuotKham/1/chi-dinh-dich-vu`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'BENH_VIEN' from the database to any value in the mapped 'LoaiCoSo' enum.
   at lambda_method3192(Closure, String)
   at lambda_method2645(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAsync[TSourc...
```

### ✅ /api/LuotKham/danh-muc-dich-vu
- **URL Test:** `/api/LuotKham/danh-muc-dich-vu`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ❌ /api/LuotKham/danh-sach-donthuoc
- **URL Test:** `/api/LuotKham/danh-sach-donthuoc`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'HOAN_THANH' from the database to any value in the mapped 'TrangThaiDonThuoc' enum.
   at lambda_method3436(Closure, String)
   at lambda_method4354(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQuer...
```

### ✅ /api/LuotKham/thong-ke-donthuoc
- **URL Test:** `/api/LuotKham/thong-ke-donthuoc`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"tongDonThuoc": 1, "daDuyet": 0, "daXuatHet": 0, "daHuy": 0, "tam": 0}}
```

### ✅ /api/LuotKham/hang-doi
- **URL Test:** `/api/LuotKham/hang-doi`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 1000, "totalCount": 0, "totalPages": 0, "items": [], "hasPreviousPage": true, "hasNextPage": false}}
```

### ✅ /api/LuotKham/hang-doi-list
- **URL Test:** `/api/LuotKham/hang-doi-list`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 1000, "totalCount": 0, "totalPages": 0, "items": [], "hasPreviousPage": true, "hasNextPage": false}}
```

### ❌ /api/LuotKham
- **URL Test:** `/api/LuotKham`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'BENH_VIEN' from the database to any value in the mapped 'LoaiCoSo' enum.
   at lambda_method3192(Closure, String)
   at lambda_method4751(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 so...
```

### ❌ /api/LuotKham/{id}
- **URL Test:** `/api/LuotKham/1`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'BENH_VIEN' from the database to any value in the mapped 'LoaiCoSo' enum.
   at lambda_method3192(Closure, String)
   at lambda_method2645(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAsync[TSourc...
```

### ❌ /api/LuotKham/{id}/summary
- **URL Test:** `/api/LuotKham/1/summary`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'BENH_VIEN' from the database to any value in the mapped 'LoaiCoSo' enum.
   at lambda_method3192(Closure, String)
   at lambda_method2645(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.Query.ShapedQueryCompilingExpressionVisitor.SingleOrDefaultAsync[TSourc...
```

### ❌ /api/LuotKham/thong-ke
- **URL Test:** `/api/LuotKham/thong-ke`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'BENH_VIEN' from the database to any value in the mapped 'LoaiCoSo' enum.
   at lambda_method3192(Closure, String)
   at lambda_method4837(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 so...
```

### ❌ /api/LuotKham/dang-xu-ly
- **URL Test:** `/api/LuotKham/dang-xu-ly`
- **Status:** `500`
- **Response:**
```json
System.InvalidOperationException: Cannot convert string value 'BENH_VIEN' from the database to any value in the mapped 'LoaiCoSo' enum.
   at lambda_method3192(Closure, String)
   at lambda_method4905(Closure, QueryContext, DbDataReader, ResultContext, SingleQueryResultCoordinator)
   at Microsoft.EntityFrameworkCore.Query.Internal.SingleQueryingEnumerable`1.AsyncEnumerator.MoveNextAsync()
   at Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync[TSource](IQueryable`1 so...
```

### ✅ /api/LuotKham/danh-sach-benh-nhan
- **URL Test:** `/api/LuotKham/danh-sach-benh-nhan`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 10, "totalCount": 3, "totalPages": 1, "items": [{"id": 6, "maBenhNhanNoiBo": "", "hoTen": "Lê Bảo Hiểm", "gioiTinh": "O", "tuoi": 37, "dienThoai": "0900000030", "maLuotKhamGanNhat": "3", "khoa": "Khoa Nội test", "bacSi": "Bác Sĩ Test", "trangThaiLuotKham": "HOAN_THANH", "thoiGianBatDauKham": null, "soThuTu": 3}, {"id": 5, "maBenhNhanNoiBo": "", "hoTen": "Trần Dị Ứng", "gioiTinh": "O", "tuoi": 34, "dienThoai": "090000...
```

### ✅ /api/LuotKham/thong-ke-benh-nhan
- **URL Test:** `/api/LuotKham/thong-ke-benh-nhan`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"homNay": 0, "cho": 0, "dangKham": 1, "hoanThanh": 2}}
```

### ✅ /api/LuotKham/thong-ke-kham-benh
- **URL Test:** `/api/LuotKham/thong-ke-kham-benh`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"cho": 0, "dangKham": 1, "choCLS": 0, "hoanThanh": 2, "daKham": 0}}
```

### ✅ /api/LuotKham/{id}/examination
- **URL Test:** `/api/LuotKham/1/examination`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"lyDoKham": "Sốt nhẹ 2 ngày", "ghiChuTienSu": null, "tienSuBenhs": [], "sinhHieu": {"id": 1, "thoiDiemDo": "2026-09-16T08:05:00", "huyetApTamThu": 120, "huyetApTamTruong": 80, "mach": 80, "nhietDo": 37.5, "canNang": 60.0, "chieuCao": 165.0, "spO2": 98.0}}}
```

### ✅ /api/NghiPhep
- **URL Test:** `/api/NghiPhep`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/NhanVien
- **URL Test:** `/api/NhanVien`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": {"pageIndex": 1, "pageSize": 20, "totalCount": 3, "totalPages": 1, "items": [{"id": 5, "username": "admin.test", "hoTen": "Admin Test", "email": "admin@example.local", "dienThoai": "0900000001", "tenChucVu": null, "chuyenKhoa": "Quản trị hệ thống", "isActive": true, "lastLogin": "2026-09-17T01:18:25.668372"}, {"id": 6, "username": "doctor.test", "hoTen": "Bác Sĩ Test", "email": "doctor@example.local", "dienThoai": "0900000002", "tenChucVu": null...
```

### ❌ /api/NhanVien/{id}
- **URL Test:** `/api/NhanVien/1`
- **Status:** `404`
- **Response:**
```json
{"success": false, "message": "Không tìm thấy nhân viên.", "data": null}
```

### ✅ /api/NhanVien/roles
- **URL Test:** `/api/NhanVien/roles`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"id": 3, "tenVaiTro": "ADMIN_TEST", "moTa": "Role test toàn quyền hệ thống"}]}
```

### ✅ /api/NhanVien/{id}/permissions
- **URL Test:** `/api/NhanVien/1/permissions`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/NhanVien/bac-si
- **URL Test:** `/api/NhanVien/bac-si`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/NhanVien/bac-si-truc
- **URL Test:** `/api/NhanVien/bac-si-truc`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/payroll/periods
- **URL Test:** `/api/payroll/periods`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ❌ /api/payroll/periods/{id}
- **URL Test:** `/api/payroll/periods/1`
- **Status:** `500`
- **Response:**
```json
System.Collections.Generic.KeyNotFoundException: Không tìm thấy kỳ lương.
   at ClinicManagement.Application.Features.Payroll.GetPayrollPeriodHandler.Handle(GetPayrollPeriodQuery query, CancellationToken cancellationToken) in /Users/jtuong/Documents/ClinicManagement.worktrees/clinicmanagement-ui-layout-update/ClinicManagement.Application/Features/Payroll/Queries/LayChiTietKyLuong/LayChiTietKyLuongQueryHandler.cs:line 14
   at ClinicManagement.API.Controllers.PayrollController.Detail(Int32 id, Ca...
```

### ✅ /api/PhongKham/by-khoa/{maKhoa}
- **URL Test:** `/api/PhongKham/by-khoa/1`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/PhongKham/dropdown
- **URL Test:** `/api/PhongKham/dropdown`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": []}
```

### ✅ /api/luot-kham/{luotKhamId}/don-thuoc
- **URL Test:** `/api/luot-kham/1/don-thuoc`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": null}
```

### ❌ /api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}
- **URL Test:** `/api/luot-kham/1/don-thuoc/1`
- **Status:** `404`
- **Response:**
```json
{"success": false, "message": "Không tìm thấy đơn thuốc.", "data": null}
```

### ✅ /api/Thuoc/catalog
- **URL Test:** `/api/Thuoc/catalog`
- **Status:** `200`
- **Response:**
```json
{"success": true, "message": "Thành công", "data": [{"id": 4, "ma": "THUOC-AMO-TEST", "ten": "Amoxicillin test 500mg", "tenGoc": "Amoxicillin", "hoatChat": "Amoxicillin", "hamLuong": "500mg", "donViTinh": "Viên", "gia": 2500.0, "tonKho": 10.0, "bhyt": true, "tyLeBHYT": 80.0}, {"id": 3, "ma": "THUOC-PARA-TEST", "ten": "Paracetamol test 500mg", "tenGoc": "Paracetamol", "hoatChat": "Paracetamol", "hamLuong": "500mg", "donViTinh": "Viên", "gia": 1500.0, "tonKho": 500.0, "bhyt": true, "tyLeBHYT": 80....
```
