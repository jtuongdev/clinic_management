# Báo cáo triển khai Governance, Audit và Giao dịch lâm sàng

## 1. Mục đích

Thư mục này ghi lại các hạng mục vừa triển khai trong Backend vào ngày 16/09/2026:

- Lưu thật ma trận quyền theo vai trò bằng Entity Framework Core.
- Kiểm tra quyền theo `Module`, `PermissionAction` và `DataScope` tại API layer.
- Bổ sung API xuất EMR audit trail dạng CSV.
- Bổ sung API tóm tắt và kiểm tra transaction lâm sàng.
- Tạo migration cho các bảng governance.
- Chuẩn hóa tên các file Billing tổng hợp sang tiếng Việt không dấu.

## 2. Có dựa vào tài liệu trước đó không?

**Có.** Phần triển khai được đối chiếu từ các tài liệu sau:

| Tài liệu tham chiếu | Nội dung được sử dụng |
|---|---|
| `doc/03-backend-api/bao-cao-governance-clinical-backend/01-api-contract.md` | Contract role, audit, integration config và clinical safety |
| `doc/03-backend-api/bao-cao-governance-clinical-backend/03-business-rules.md` | Quy tắc khóa EMR, audit trail và quyền |
| `doc/03-backend-api/bao-cao-governance-clinical-backend/04-implementation-status.md` | Các khoảng trống cần chuyển từ mock sang persistence thật |
| `doc/02-gap-analysis/bao-cao-technical-lead-his/tai-lieu-nghiep-vu-flows/02_FLOW_KHAM_BENH_VA_EMR.md` | Flow khám bệnh, EMR, chẩn đoán và hoàn tất lượt khám |
| `doc/02-gap-analysis/bao-cao-technical-lead-his/tai-lieu-nghiep-vu-flows/05_FLOW_VIEN_PHI_THANH_TOAN.md` | Điểm nối giữa hoàn tất lượt khám và viện phí |
| `doc/03-backend-api/BACKEND_IMPLEMENTATION_WALKTHROUGH.md` | Cấu trúc Backend, API contract và hướng dẫn handoff |

Đây là báo cáo **đối chiếu việc đã làm với tài liệu**, không phải tài liệu thiết kế độc lập.

## 3. Danh sách báo cáo

- [01-chi-tiet-thay-doi.md](./01-chi-tiet-thay-doi.md): File code, entity, repository, API và migration.
- [02-api-va-business-flow.md](./02-api-va-business-flow.md): API contract và flow nghiệp vụ.
- [03-kiem-tra-va-cong-viec-con-lai.md](./03-kiem-tra-va-cong-viec-con-lai.md): Kết quả build, cách áp dụng migration và giới hạn còn lại.
- [04-doi-chieu-tai-lieu-tich-hop.md](./04-doi-chieu-tai-lieu-tich-hop.md): Đối chiếu thực tế với tài liệu tích hợp Backend–Frontend và các contract còn lệch.
- [05-bao-cao-fix-va-xac-minh.md](./05-bao-cao-fix-va-xac-minh.md): Danh sách lỗi đã sửa, kiểm chứng build và hướng dẫn test sau sửa.
