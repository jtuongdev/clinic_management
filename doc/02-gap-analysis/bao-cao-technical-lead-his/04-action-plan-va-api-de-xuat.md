# 04. Action plan và đặc tả API đề xuất

## 4.1. Công việc ưu tiên

| Mức | Công việc | Kết quả nghiệm thu |
|---|---|---|
| Khẩn cấp P0 | Xóa secret/password khỏi config commit | Config chỉ dùng environment/secret store |
| Khẩn cấp P0 | Global exception + ProblemDetails + correlation ID | Mọi lỗi có format và traceId thống nhất |
| Khẩn cấp P0 | Policy authorization và data scope | Endpoint nhạy cảm bị chặn đúng vai trò/cơ sở |
| Khẩn cấp P0 | Transaction hoàn tất khám/Billing | Lỗi giữa chừng rollback toàn bộ |
| Khẩn cấp P0 | Transaction cấp phát/trừ kho/idempotency | Retry không cấp trùng, không âm tồn |
| Quan trọng P1 | Hoàn thiện CLS workflow | Chỉ định -> tiếp nhận -> thực hiện -> kết quả -> duyệt |
| Quan trọng P1 | Hoàn thiện thu tiền | Refund/void/đối soát/khóa ca |
| Quan trọng P1 | EMR audit và ký/khóa hồ sơ | Có lịch sử sửa và không sửa hồ sơ đã khóa |
| Quan trọng P1 | Bảng giá/version và BHYT | Tính tiền theo effective date, quyền lợi |
| Cải tiến P2 | Reporting/export | Báo cáo vận hành và tài chính có phân quyền |
| Cải tiến P2 | FHIR/HL7/e-invoice/AI | Tích hợp ngoài hệ thống |
| Cải tiến P2 | Nội trú | Bed management, y lệnh, điều dưỡng |

## 4.2. API cần bổ sung - nhóm tiếp nhận và lượt khám

| Method | Endpoint | Request/Response tóm tắt | Mục đích |
|---|---|---|---|
| POST | `/api/reception/appointments` | `patientId, facilityId, departmentId, doctorId, slotAt`; trả `appointmentId` | Đặt lịch |
| POST | `/api/reception/visits` | `patientId, appointmentId?, payerType`; trả `visitId, queueNumber` | Tạo lượt tiếp nhận chuẩn |
| POST | `/api/LuotKham/{id}/cancel` | `reason`; trả trạng thái | Hủy lượt có lý do |
| POST | `/api/LuotKham/{id}/transfer` | `targetDepartmentId, reason`; trả lịch sử chuyển | Chuyển khoa/phòng |
| POST | `/api/LuotKham/{id}/triage` | `priority, vitalSigns, note`; trả mức ưu tiên | Phân loại ban đầu |

## 4.3. API cần bổ sung - nhóm EMR/CLS

| Method | Endpoint | Request/Response tóm tắt | Mục đích |
|---|---|---|---|
| POST | `/api/luot-kham/{id}/emr/lock` | `reason`; trả `lockedAt, lockedBy` | Khóa bệnh án |
| POST | `/api/luot-kham/{id}/emr/unlock` | `reason`; trả audit entry | Mở khóa có kiểm soát |
| GET | `/api/luot-kham/{id}/emr/audit` | filter thời gian; trả before/after | Audit EMR |
| POST | `/api/chi-dinh/{id}/receive` | `receivedAt`; trả trạng thái | CLS tiếp nhận |
| POST | `/api/chi-dinh/{id}/perform` | `performedBy`; trả trạng thái | CLS thực hiện |
| POST | `/api/chi-dinh/{id}/result` | `resultText, attachments[]`; trả result id | Trả kết quả |
| POST | `/api/chi-dinh/{id}/approve-result` | `note`; trả `approvedBy, approvedAt` | Bác sĩ duyệt kết quả |

## 4.4. API cần bổ sung - nhóm dược/kho

| Method | Endpoint | Request/Response tóm tắt | Mục đích |
|---|---|---|---|
| POST | `/api/inventory/prescriptions/{id}/reserve` | `warehouseId, idempotencyKey`; trả reservation | Giữ tồn trước cấp |
| POST | `/api/inventory/prescriptions/{id}/release` | `reason`; trả trạng thái | Hủy giữ tồn |
| POST | `/api/inventory/prescriptions/{id}/dispense/preview` | `warehouseId`; trả lot/qty đề xuất | Cho UI xem trước |
| GET | `/api/inventory/items/{id}/lots` | filter expiry/warehouse; trả lot tồn | Chọn lot FEFO |
| POST | `/api/inventory/transfers` | `fromWarehouseId, toWarehouseId, lines[]` | Điều chuyển kho |
| GET | `/api/inventory/expiries` | `fromDate, toDate`; trả lot sắp hết hạn | Quản lý hạn dùng |

## 4.5. API cần bổ sung - nhóm viện phí

| Method | Endpoint | Request/Response tóm tắt | Mục đích |
|---|---|---|---|
| POST | `/api/billing/invoices/{id}/payments/{paymentId}/void` | `reason`; trả receipt status | Hủy phiếu thu |
| POST | `/api/billing/invoices/{id}/refunds` | `amount, reason, paymentId`; trả refund | Hoàn tiền |
| POST | `/api/billing/cashier-sessions` | `cashierId, openingAmount`; trả session | Mở ca thu |
| POST | `/api/billing/cashier-sessions/{id}/close` | `actualAmount`; trả variance | Khóa ca/đối soát |
| GET | `/api/billing/reconciliation/daily` | `facilityId, date`; trả expected/actual | Đối soát doanh thu |
| POST | `/api/billing/insurance/eligibility` | `patientId, cardNo, serviceDate`; trả quyền lợi | Kiểm tra BHYT |
| POST | `/api/billing/invoices/{id}/finalize` | `version`; trả invoice number | Chốt hóa đơn bất biến |

## 4.6. API cần bổ sung - audit/vận hành

| Method | Endpoint | Request/Response tóm tắt | Mục đích |
|---|---|---|---|
| GET | `/api/audit/events` | filter module/user/date; trả event list | Tra cứu audit |
| GET | `/health/live` | status | Liveness |
| GET | `/health/ready` | DB/dependency status | Readiness |
| GET | `/api/system/capabilities` | role/module flags | UI bật/tắt chức năng |

## 4.7. Lộ trình 4 sprint

### Sprint 1 - P0 nền tảng

- Secret/config, CORS, rate limit login.
- Global exception, ProblemDetails, correlation ID.
- Role/policy/data scope.
- Transaction abstraction và concurrency token.

### Sprint 2 - P0 liên thông

- Hoàn thiện transaction CompleteExam/Billing.
- Reservation/cấp phát/trừ kho/idempotency.
- Unique constraints và rollback tests.

### Sprint 3 - P1 nghiệp vụ

- CLS workflow đầy đủ.
- Refund/void/đối soát.
- EMR lock/audit/versioning.
- Reception/appointment/triage.

### Sprint 4 - P2 sản phẩm

- Reporting/export.
- FHIR/HL7/e-invoice/AI integration.
- Health checks, metrics, backup drill.

