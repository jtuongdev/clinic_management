# 03. Gap analysis nghiệp vụ và kỹ thuật

## 3.1. Gaps theo luồng HIS

| Mức | Luồng | Hiện trạng | Hậu quả |
|---|---|---|---|
| P0 | Xác thực và phân quyền thao tác | Nhiều controller chỉ `[Authorize]`, thiếu policy theo vai trò | Bác sĩ/thu ngân/dược sĩ có thể gọi nhầm chức năng |
| P0 | Transaction hoàn tất khám -> hóa đơn -> công nợ | Có handler tạo nhiều aggregate; cần transaction xuyên bước | Có thể lưu trạng thái khám nhưng thiếu Billing khi lỗi giữa chừng |
| P0 | Trừ kho/cấp phát | Có API dispense và xuất kho nhưng cần kiểm tra atomically theo tồn/lô | Âm tồn, cấp trùng, sai tồn khi retry |
| P0 | Secret/config | JWT secret và connection string không nên commit/config cứng | Rò rỉ credential, không đủ an toàn production |
| P1 | Chỉ định CLS | Có CRUD chỉ định nhưng thiếu workflow tiếp nhận/thực hiện/trả kết quả/duyệt | EMR không có kết quả xét nghiệm hoàn chỉnh |
| P1 | Kê đơn -> cấp phát | Có trạng thái và endpoint, nhưng thiếu reservation, thay thế thuốc, kiểm tra tương tác | Dễ kê vượt tồn hoặc cấp không đúng |
| P1 | BHYT | Áp dụng số tiền BHYT trên hóa đơn | Chưa có thẻ, eligibility, quyền lợi, claim/đối soát |
| P1 | Thu tiền | Có thu nhiều lần và công nợ | Thiếu refund, void receipt, ca thu, đối soát cuối ngày |
| P1 | Bệnh án EMR | Có dữ liệu khám và chẩn đoán | Thiếu versioning, ký số, khóa hồ sơ, audit ai sửa gì |
| P1 | Tiếp nhận | Có lượt khám/queue nhưng chưa có flow appointment/reception/triage hoàn chỉnh | Khó chứng minh flow HIS từ đầu vào |
| P2 | Báo cáo | Có statistics theo module | Thiếu báo cáo doanh thu, sử dụng thuốc, SLA CLS, bác sĩ |
| P2 | Liên thông | Chưa thấy FHIR/HL7, e-invoice, cổng BHYT | Không đạt HIS tích hợp thực tế |
| P2 | Nội trú | Chưa có giường, khoa nội trú, y lệnh, điều dưỡng | Phạm vi hiện chỉ gần outpatient |

## 3.2. Gaps về transaction và consistency

- `CompleteExam` phải bao bọc ít nhất:
  - cập nhật `LuotKham`;
  - tạo `HoaDon`;
  - tạo `ChiTietHoaDon`;
  - tạo `CongNoBenhNhan`.
- Dispense phải bảo đảm một transaction gồm:
  - lock/kiểm tra tồn;
  - tạo phiếu xuất;
  - trừ tồn theo lot/expiry;
  - cập nhật trạng thái đơn;
  - ghi idempotency key.
- Record payment phải chống double-submit bằng payment reference/idempotency key.
- Các thao tác approve/finalize/close/pay phải dùng optimistic concurrency hoặc state transition có điều kiện.
- Cần unique constraint cho hóa đơn chưa hủy theo lượt khám và đơn đã duyệt theo lượt khám.

## 3.3. Gaps về validation

- Chuẩn hóa validation bằng FluentValidation hoặc DataAnnotations nhất quán.
- Validate facility/department/doctor có cùng scope với user.
- Validate ngày giờ theo timezone cơ sở.
- Validate tiền không âm, số lượng > 0, đơn vị quy đổi hợp lệ.
- Validate trạng thái trước mọi mutation, không chỉ dựa vào UI.
- Validate duplicate ICD chính, duplicate item trong đơn, duplicate payment reference.
- Validate upload kết quả CLS: loại file, kích thước, virus scan, quyền truy cập.

## 3.4. Gaps về exception handling

- Chưa thấy global exception middleware chuẩn ProblemDetails.
- Không nên trả `exception.Message` trực tiếp ở production vì có thể lộ chi tiết nội bộ.
- Cần map lỗi nghiệp vụ thành mã ổn định:

```json
{
  "type": "https://clinic.example/errors/insufficient-stock",
  "code": "INSUFFICIENT_STOCK",
  "message": "Tồn kho không đủ",
  "traceId": "..."
}
```

- Mọi request cần `traceId/correlationId`; log không ghi token/password.
- Không dùng `Console.WriteLine` để log JWT/token trong production.

## 3.5. Gaps về authorization và bảo mật

- CORS `AllowAnyOrigin` phải giới hạn theo domain UI.
- Chuyển JWT secret/DB password sang environment/secret manager.
- Định nghĩa policy:
  - `DoctorClinicalWrite`;
  - `PharmacyDispense`;
  - `CashierPayment`;
  - `BillingSupervisor`;
  - `HrPayroll`;
  - `SystemAdmin`.
- Kiểm tra data scope: user chỉ xem cơ sở/khoa được phân công.
- Thêm rate limit cho login và endpoint nhạy cảm.
- Không coi `/has-role/{role}` là cơ chế authorization; đó chỉ là API kiểm tra.
- Logout cần revoke/blacklist refresh token nếu hệ thống có refresh token.

## 3.6. Gaps về dữ liệu và audit

- EMR cần audit append-only: user, thời gian, IP, before/after, lý do chỉnh sửa.
- Billing cần audit hóa đơn, dòng tiền, người duyệt/hủy/hoàn.
- Kho cần audit lot, expiry, serial (nếu có), người xuất/nhập.
- Cần soft-delete nhất quán và không cho xóa dữ liệu đã phát sinh tài chính/lâm sàng.
- Cần migration/seed data tách rõ development và production.

## 3.7. Gaps về kiểm thử và vận hành

- Thiếu test tích hợp cho transaction rollback.
- Thiếu test concurrency cấp phát/thu tiền.
- Thiếu contract test giữa AdminUI và API.
- Cần health check DB, readiness/liveness, metrics và structured logging.
- Cần backup/restore drill và migration rollback strategy.

