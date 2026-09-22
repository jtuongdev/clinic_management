# 05. Kết luận đồ án và checklist nghiệm thu

## 5.1. Đánh giá phù hợp báo cáo/đồ án

### Phạm vi nên cam kết

Nên định danh sản phẩm là:

> Hệ thống HIS ngoại trú cho phòng khám, gồm quản lý bệnh nhân, lượt khám, EMR cơ bản, kê đơn, kho dược và viện phí.

Không nên tuyên bố là HIS bệnh viện đầy đủ nếu chưa có:

- Nội trú/giường bệnh.
- Cấp cứu.
- Phẫu thuật/thủ thuật.
- Điều dưỡng/y lệnh.
- BHYT/claim thực tế.
- Hóa đơn điện tử.
- Chuẩn liên thông HL7/FHIR.

### Điểm mạnh nên trình bày

- Có phân tầng Domain/Application/Infrastructure/API.
- Có JWT authentication và MediatR.
- Có lifecycle lượt khám.
- Có liên thông khám -> đơn thuốc -> cấp phát -> Billing.
- Có quản lý tồn, nhập/xuất/trả/kiểm kê.
- Có công nợ và thanh toán nhiều lần.
- Có frontend AdminUI gọi API thật.

### Điểm cần nói rõ trong phần giới hạn

- Chưa production-ready về bảo mật và authorization.
- Chưa có transaction/concurrency coverage đầy đủ.
- CLS mới ở mức chỉ định và thống kê.
- BHYT là mô phỏng áp dụng số tiền, chưa liên thông cổng bảo hiểm.
- Logout chưa revoke token.
- AI/integration chưa triển khai thành module hoàn chỉnh.

## 5.2. Checklist nghiệm thu nghiệp vụ

| STT | Kịch bản | Kết quả bắt buộc |
|---:|---|---|
| 1 | Login đúng/sai | JWT đúng; sai trả 401, không lộ chi tiết |
| 2 | Tạo bệnh nhân | Validate bắt buộc, chống trùng định danh |
| 3 | Tạo lượt khám | Có bệnh nhân/cơ sở/khoa hợp lệ |
| 4 | Hàng đợi | Số thứ tự và trạng thái nhất quán |
| 5 | Bắt đầu khám | Chỉ `CHO_KHAM -> DANG_KHAM` |
| 6 | Lưu khám | Sinh hiệu/tiền sử tải lại đúng |
| 7 | Chẩn đoán | Chỉ một chẩn đoán chính |
| 8 | Chỉ định CLS | Có người chỉ định và trạng thái |
| 9 | Kê đơn | Không kê mặt hàng inactive/trùng/vượt validation |
| 10 | Duyệt đơn | Chỉ bác sĩ hợp lệ, không có đơn duyệt trùng |
| 11 | Cấp phát | Không âm tồn, retry không cấp trùng |
| 12 | Hoàn tất khám | Tạo Billing một lần, rollback khi lỗi |
| 13 | Thanh toán | Không thu vượt, hỗ trợ nhiều lần |
| 14 | Công nợ | Số dư = phải thu - đã trả - BHYT |
| 15 | Phân quyền | Bác sĩ không ghi nhận thanh toán; thu ngân không sửa EMR |
| 16 | Audit | Có người/thời gian/lý do cho thao tác nhạy cảm |
| 17 | Lỗi hệ thống | Response có mã lỗi và traceId |

## 5.3. Tiêu chí “đủ để bảo vệ”

Đạt mức đồ án tốt nghiệp khi:

- 100% kịch bản 1-14 chạy được trong môi trường demo.
- Có sơ đồ kiến trúc và ERD.
- Có API catalog và sequence diagram cho 3 flow chính.
- Có test cho happy path và tối thiểu 5 negative cases.
- Có tài liệu giới hạn phạm vi, không tuyên bố quá mức.
- Không commit secret/password thật.

## 5.4. Kết luận

Backend hiện tại đã vượt mức CRUD demo đơn giản và có nền tảng HIS ngoại trú tương đối rõ. Điểm nghẽn chính không nằm ở số lượng endpoint mà ở mức độ khép kín, tính nguyên tử, phân quyền và audit. Nếu hoàn thành toàn bộ P0 và một nửa P1, dự án có thể nâng từ khoảng **55% HIS tổng thể** lên **70-75% HIS outpatient**, đủ chắc cho đồ án và bản demo nghiệp vụ. Để đạt production hospital HIS, vẫn cần một chương trình phát triển riêng cho inpatient, integration, compliance và vận hành.

