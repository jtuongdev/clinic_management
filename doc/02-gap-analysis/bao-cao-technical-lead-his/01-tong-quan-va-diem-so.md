# 01. Tổng quan hiện trạng và điểm hoàn thiện

## 1.1. Kiến trúc hiện tại

| Tầng | Hiện trạng |
|---|---|
| API | ASP.NET Core Controllers, JWT Bearer, OpenAPI/Scalar |
| Application | MediatR command/query, DTO và feature theo nghiệp vụ |
| Domain | Aggregate/entity cho bệnh nhân, lượt khám, đơn thuốc, kho, Billing |
| Infrastructure | EF Core SQL Server, repository, migrations |
| Frontend | React/Vite AdminUI gọi API qua Axios |
| Response | Wrapper `success/data/message` ở nhiều API |

## 1.2. Chấm điểm theo phân hệ

Điểm phản ánh mức API và nghiệp vụ đã có, không đồng nghĩa với mức production readiness.

| Phân hệ | API/nghiệp vụ đã có | Ước lượng | Nhận xét chính |
|---|---|---:|---|
| Auth/Identity | Login, me, validate, role check, logout | 65% | Có JWT nhưng logout chưa revoke token, policy chưa áp dụng đồng đều |
| Quản lý bệnh nhân | CRUD, search, filter, deleted, tiền sử, profile | 75% | Thiếu merge/deduplicate, lịch sử thay đổi và consent |
| Lượt khám/queue | List, detail, summary, queue, start, complete | 70% | Có lifecycle cơ bản; thiếu hủy/chuyển khoa/đặt lịch đầy đủ |
| EMR khám bệnh | Khám ban đầu, sinh hiệu, tiền sử, chẩn đoán ICD | 60% | Chưa có versioning, ký số, khóa hồ sơ, audit lâm sàng |
| CLS | Danh mục, chỉ định CRUD, list/statistics | 45% | Thiếu tiếp nhận, thực hiện, trả kết quả, duyệt kết quả đầy đủ |
| Đơn thuốc | Tạo/sửa tạm, duyệt, hủy, xem | 65% | Đã nối cấp phát nhưng thiếu kiểm tra tương tác, thay thế, kê ngoại trú hoàn chỉnh |
| Dược/Kho | Danh mục, nhập, xuất, cấp phát, trả, hủy, tồn, kiểm kê, audit | 75% | Khá đầy đủ cho kho cơ bản; cần transaction, lot/expiry và reservation chặt hơn |
| Billing/viện phí | Hóa đơn, chi tiết, thu nhiều lần, BHYT, hủy, công nợ | 65% | Thiếu refund, đối soát, khóa sổ, bảng giá và bảo hiểm thực tế |
| Nhân sự/RBAC | Nhân viên, role, ca, lịch, công, nghỉ, payroll | 70% | Nhiều API quản trị; policy authorization và workflow duyệt cần siết |
| AI/tích hợp | Chưa thấy controller/service AI rõ ràng | 10% | Chưa đủ để gọi là phân hệ tích hợp AI |
| Báo cáo/BI | Một số statistics theo module | 35% | Thiếu báo cáo chuẩn HIS, export, snapshot và phân quyền dữ liệu |
| Vận hành/audit | Logging rải rác, migrations | 35% | Thiếu correlation ID, audit trail nghiệp vụ, health check, observability |

## 1.3. Đánh giá tổng thể

| Góc nhìn | Mức đáp ứng |
|---|---:|
| HIS outpatient tối thiểu cho demo | 70% |
| HIS outpatient có EMR/CLS/dược/viện phí khép kín | 55% |
| HIS bệnh viện production đầy đủ | 35-40% |
| Phù hợp báo cáo/đồ án tốt nghiệp có giới hạn phạm vi | 75% |
| Tổng thể dự án so với HIS hoàn chỉnh | **55%** |

## 1.4. Luồng đã chạy được

```text
Đăng nhập
  -> tạo/quản lý bệnh nhân
  -> tạo lượt khám
  -> vào hàng đợi
  -> bắt đầu khám
  -> lưu khám ban đầu
  -> chẩn đoán
  -> kê đơn
  -> cấp phát/kho
  -> hoàn tất lượt khám
  -> tạo hóa đơn/công nợ
  -> ghi nhận thanh toán
```

## 1.5. Luồng chưa khép kín

- Tiếp nhận hành chính và thu phí đầu vào chưa thành workflow đầy đủ.
- CLS mới dừng ở chỉ định; chưa khép kín chỉ định -> thực hiện -> kết quả -> bác sĩ duyệt.
- Đơn thuốc có thể tạo/duyệt nhưng thiếu đảm bảo reservation/trừ kho xuyên transaction.
- BHYT mới là điều chỉnh hóa đơn, chưa phải engine eligibility/claim.
- Billing chưa có hoàn tiền, đối soát, khóa sổ và hóa đơn điện tử.
- Chưa có inpatient, phẫu thuật, giường bệnh, cấp cứu, bảo hiểm claim và liên thông chuẩn HL7/FHIR.

## 1.6. Rủi ro kỹ thuật nổi bật

- `AllowAnyOrigin`, `AllowAnyMethod`, `AllowAnyHeader` không phù hợp production.
- Secret JWT và connection string đang hiện diện trong `appsettings.json`; phải chuyển sang secret store/environment.
- Một số controller chỉ có `[Authorize]`, chưa có policy/role theo chức năng.
- Nhiều command gọi `SaveChangesAsync` riêng lẻ; flow xuyên aggregate chưa có transaction nhất quán.
- Có nơi catch rồi trả lỗi thủ công, nơi khác throw lên middleware; response lỗi chưa đồng nhất.
- Chưa thấy global exception handler/problem details và correlation ID chuẩn.

