# 02. Danh mục endpoint backend

> Prefix được suy ra từ `[Route]` của controller. Các endpoint đều yêu cầu Bearer JWT trừ nơi ghi rõ `AllowAnonymous`.

## Auth

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/api/Auth/login` | Đăng nhập, cấp JWT |
| GET | `/api/Auth/me` | Thông tin user hiện tại |
| GET | `/api/Auth/validate` | Kiểm tra token |
| GET | `/api/Auth/has-role/{role}` | Kiểm tra role |
| POST | `/api/Auth/logout` | Đăng xuất phía client; chưa revoke token server-side |

## Bệnh nhân

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/BenhNhan/paged` | Danh sách phân trang |
| GET | `/api/BenhNhan/count/benhnhan/thongke` | Thống kê số lượng |
| POST | `/api/BenhNhan` | Tạo bệnh nhân |
| PUT | `/api/BenhNhan/{id}` | Cập nhật bệnh nhân |
| DELETE | `/api/BenhNhan/{id}` | Xóa bệnh nhân |
| GET | `/api/BenhNhan/{id}` | Chi tiết |
| GET | `/api/BenhNhan/search` | Tìm kiếm |
| GET | `/api/BenhNhan/filter-by-date` | Lọc theo ngày |
| GET | `/api/BenhNhan/deleted` | Danh sách đã xóa |
| GET | `/api/BenhNhan/{id}/tiensu` | Tiền sử |
| GET | `/api/BenhNhan/{id}/tiensu/latest` | Tiền sử mới nhất |
| GET | `/api/BenhNhan/loai-tien-su` | Danh mục loại tiền sử |

### Hồ sơ bệnh nhân tổng hợp

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/BenhNhan/{id}/profile` | Profile tổng hợp |
| GET | `/api/BenhNhan/{id}/visits` | Lịch sử lượt khám |
| GET | `/api/BenhNhan/{id}/prescriptions` | Lịch sử đơn thuốc |
| GET | `/api/BenhNhan/{id}/lab-results` | Kết quả xét nghiệm |
| GET | `/api/BenhNhan/{id}/invoices` | Hóa đơn |

## Lượt khám và EMR

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/LuotKham` | Danh sách lượt khám |
| GET | `/api/LuotKham/{id}` | Chi tiết lượt khám |
| GET | `/api/LuotKham/{id}/summary` | Tóm tắt |
| GET | `/api/LuotKham/thong-ke` | Thống kê lượt khám |
| GET | `/api/LuotKham/dang-xu-ly` | Lượt đang xử lý |
| GET | `/api/LuotKham/danh-sach-benh-nhan` | DS bệnh nhân theo lượt |
| GET | `/api/LuotKham/thong-ke-benh-nhan` | Thống kê bệnh nhân |
| GET | `/api/LuotKham/thong-ke-kham-benh` | Thống kê khám |
| GET | `/api/LuotKham/hang-doi`, `/hang-doi-list` | Hàng đợi |
| POST | `/api/LuotKham/{id}/start-exam` | Bắt đầu khám |
| POST | `/api/LuotKham/{id}/complete` | Hoàn tất và có thể tạo Billing |
| POST | `/api/LuotKham/{id}/examination` | Lưu khám ban đầu/sinh hiệu/tiền sử |
| GET | `/api/LuotKham/{id}/examination` | Đọc khám ban đầu |
| GET | `/api/LuotKham/{id}/diagnoses` | Danh sách chẩn đoán |
| POST/PUT/DELETE | `/api/LuotKham/{id}/diagnoses[/{diagnosisId}]` | CRUD chẩn đoán |
| GET | `/api/LuotKham/icd` | Tìm mã ICD |
| GET | `/api/LuotKham/danh-muc-dich-vu` | Danh mục dịch vụ |
| GET/POST/PUT/DELETE | `/api/LuotKham/{id}/chi-dinh-dich-vu[/{serviceId}]` | CRUD chỉ định |
| GET | `/api/LuotKham/danh-sach-chi-dinh` | Danh sách chỉ định |
| GET | `/api/LuotKham/thong-ke-chi-dinh` | Thống kê chỉ định |
| GET | `/api/LuotKham/danh-sach-donthuoc` | Danh sách đơn thuốc |
| GET | `/api/LuotKham/thong-ke-donthuoc` | Thống kê đơn thuốc |

## Đơn thuốc

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/api/luot-kham/{luotKhamId}/don-thuoc` | Tạo đơn tạm |
| PUT | `/api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/items` | Thay dòng đơn tạm |
| POST | `/api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/approve` | Duyệt đơn |
| POST | `/api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}/cancel` | Hủy đơn |
| GET | `/api/luot-kham/{luotKhamId}/don-thuoc/{donThuocId}` | Chi tiết đơn |

## Dược/Kho

| Method | Endpoint | Mục đích |
|---|---|---|
| GET/POST/PUT | `/api/inventory/items[/{id}]` | Danh mục mặt hàng |
| POST | `/api/inventory/items/{id}/toggle-status` | Bật/tắt mặt hàng |
| GET/POST/PUT | `/api/inventory/suppliers[/{id}]` | Nhà cung cấp |
| POST | `/api/inventory/suppliers/{id}/toggle-status` | Bật/tắt NCC |
| GET | `/api/inventory/stock` | Tồn kho |
| GET | `/api/inventory/stock/alerts` | Cảnh báo tồn |
| GET/POST | `/api/inventory/import-receipts` | Phiếu nhập |
| POST | `/api/inventory/import-receipts/{id}/approve` | Duyệt nhập |
| POST | `/api/inventory/exports/retail` | Xuất bán lẻ |
| POST | `/api/inventory/exports/internal-use` | Xuất nội bộ |
| POST | `/api/inventory/returns` | Trả kho |
| POST | `/api/inventory/write-offs` | Hủy/hao hụt |
| GET | `/api/inventory/audit-transactions` | Audit giao dịch kho |
| POST | `/api/inventory/stocktakes` | Tạo kiểm kê |
| PUT | `/api/inventory/stocktakes/{id}/count` | Ghi số đếm |
| POST | `/api/inventory/stocktakes/{id}/submit` | Gửi kiểm kê |
| POST | `/api/inventory/stocktakes/{id}/approve` | Duyệt kiểm kê |
| POST | `/api/inventory/stocktakes/{id}/finalize` | Chốt kiểm kê |
| GET | `/api/inventory/prescriptions/pending` | Đơn chờ cấp |
| GET | `/api/inventory/prescriptions/dispensed` | Đơn đã cấp |
| POST | `/api/inventory/prescriptions/{id}/dispense` | Cấp phát |
| GET | `/api/inventory/prescriptions/{id}/print-data` | Dữ liệu in đơn |
| POST | `/api/inventory/returns/patient` | Bệnh nhân trả thuốc |

## Billing/viện phí

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/billing/invoices` | Danh sách hóa đơn |
| GET | `/api/billing/invoices/{id}` | Chi tiết hóa đơn |
| GET | `/api/billing/invoices/by-visit/{visitId}` | Hóa đơn theo lượt |
| GET | `/api/billing/invoices/{id}/payments` | Lịch sử thu |
| POST | `/api/billing/invoices/{id}/payments` | Ghi nhận thanh toán |
| POST | `/api/billing/invoices/{id}/insurance` | Áp dụng BHYT |
| POST | `/api/billing/invoices/{id}/cancel` | Hủy hóa đơn |
| GET | `/api/billing/debts/by-patient/{patientId}` | Công nợ bệnh nhân |
| GET | `/api/billing/debts/overdue` | Công nợ quá hạn |

## Nhân sự, lịch và payroll

| Module | Endpoint chính |
|---|---|
| Nhân viên | `/api/NhanVien`, `/roles`, `/{id}/permissions`, `/{id}/roles`, `/bac-si`, `/bac-si-truc` |
| Ca trực | `/api/CaTruc` CRUD |
| Loại ca | `/api/LoaiCa` CRUD |
| Lịch làm việc | `/api/LichLamViec`, `/bulk`, `/fixed`, `/generate`, `/preview-generate`, `/{id}/adjustments` |
| Chấm công | `/api/ChamCong`, `/kpi-summary`, `/check-in`, `/check-out`, `/adjustments`, `/periods` |
| Nghỉ phép | `/api/NghiPhep`, `/{id}/review`, `/{id}/cancel` |
| Payroll | `/api/Payroll/periods`, `/{id}/generate`, `/approve`, `/close`, `/pay` |
| Danh mục | `/api/EnumCatalog/schedule-statuses`, `/attendance-statuses`, `/leave-statuses` |

## Ghi chú về AI/tích hợp

Không thấy controller/service AI riêng trong danh sách backend hiện tại. Đây là gap, không nên ghi nhận phân hệ AI là đã triển khai chỉ vì frontend có thể có màn hình hoặc tài liệu đề xuất.

