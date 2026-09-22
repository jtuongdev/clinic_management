# Hệ Thống Tài Liệu Vận Hành & Gap Analysis HIS/EMR

> **Hệ thống:** ClinicManagement HIS/EMR  
> **Phiên bản tài liệu:** 2.0 (Cập nhật chuẩn hóa Vận hành Nghiệp vụ)  
> **Ngày lập:** 2026-09-16  

---

## 🌟 TÀI LIỆU TRỌNG TÂM: HƯỚNG DẪN VẬN HÀNH NGHIỆP VỤ (SOP)

👉 **[08-tai-lieu-van-hanh-nghiep-vu-his.md](./08-tai-lieu-van-hanh-nghiep-vu-his.md)**: **Tài liệu hướng dẫn vận hành nghiệp vụ lâm sàng và hành chính toàn diện** dành riêng cho nhân viên y tế và quản lý vận hành (Bác sĩ, Điều dưỡng tiếp đón, KTV Cận lâm sàng, Dược sĩ, Thu ngân viện phí, Quản trị viên).

### 8 Quy trình cốt lõi được mô tả chi tiết:
1. **Tiếp đón, Phân luồng & Triage Cấp cứu** (Đo sinh hiệu, phân loại 🚨 Cấp cứu / ⚡ Ưu tiên / Thường).
2. **Khám bệnh Lâm sàng & Chẩn đoán Bệnh án Điện tử** (Nhận diện Sticky Allergy Banner cảnh báo dị ứng, tự tính BMI, chẩn đoán 1 bệnh chính + nhiều bệnh phụ ICD-10).
3. **Chỉ định Cận lâm sàng & Theo dõi Kết quả** (Tích hợp máy xét nghiệm LIS qua cổng MLLP, chẩn đoán hình ảnh PACS DICOM, cảnh báo chỉ số bất thường).
4. **Kê đơn Thuốc Điện tử & Kiểm soát An toàn Dược lâm sàng** (Kiểm tra tương tác thuốc, cảnh báo dị ứng trùng hoạt chất, phân loại đơn BHYT / Tự túc).
5. **Ký số, Khóa Hồ sơ Bệnh án & Xử trí Kết thúc Khám** (Checklist điều kiện y khoa bắt buộc, chữ ký số điện tử, khóa hồ sơ bất biến Read-only).
6. **Thu viện phí, Quản lý Ca Thu ngân & Thanh toán BHYT** (Mở ca đầu ngày, thu viện phí tự động tính quyền lợi thẻ BHYT, hoàn tiền/void, chốt ca đối soát cuối ngày).
7. **Cấp phát Thuốc & Quản lý Kho Dược Ngoại trú** (Kiểm soát 3 tra 5 chiếu, trừ kho tự động theo hạn dùng gần nhất FEFO).
8. **Quản trị Hệ thống, Phân quyền Dữ liệu & Kiểm toán** (Phân quyền theo phạm vi Cơ sở → Khoa → Buồng phòng, Nhật ký kiểm toán EMR Audit Trail theo Thông tư 46/2018/TT-BYT).

---

## 📚 CÁC TÀI LIỆU KỸ THUẬT & PHÂN TÍCH ĐỐI CHIẾU (DÀNH CHO ĐỘI NGŨ PHÁT TRIỂN)

| Tài liệu | Nội dung chính |
|---|---|
| [07-implementation-walkthrough.md](./07-implementation-walkthrough.md) | Báo cáo chi tiết các component và code đã hoàn thiện trên DoctorUI & AdminUI |
| [01-executive-summary-va-gap-analysis.md](./01-executive-summary-va-gap-analysis.md) | Bảng phân tích khoảng cách 110 yêu cầu theo 11 nhóm nghiệp vụ Admin |
| [02-checklist-man-hinh-can-bo-sung.md](./02-checklist-man-hinh-can-bo-sung.md) | Danh mục màn hình và trường dữ liệu y tế P0/P1/P2 |
| [03-admin-sitemap-recommended.md](./03-admin-sitemap-recommended.md) | Sơ đồ cây điều hướng Menu Admin hoàn chỉnh đề xuất |
| [04-doctorui-gap-analysis.md](./04-doctorui-gap-analysis.md) | Đánh giá giao diện Bác sĩ theo 6 trụ cột lâm sàng |
| [05-doctorui-component-checklist.md](./05-doctorui-component-checklist.md) | Danh sách thành phần giao diện lâm sàng cần bổ sung |
| [06-doctorui-ux-recommendations.md](./06-doctorui-ux-recommendations.md) | Nguyên tắc thiết kế công thái học (Ergonomics) và phím tắt thao tác nhanh cho Bác sĩ |

## 📊 BÁO CÁO RÀ SOÁT ĐỐI CHIẾU TIẾN ĐỘ & HỢP ĐỒNG API
👉 **[09-bao-cao-ra-soat-tien-do-he-thong.md](./09-bao-cao-ra-soat-tien-do-he-thong.md)**: Báo cáo rà soát tổng thể đối chiếu tiến độ hệ thống dựa trên 6 tài liệu nền tảng: `01-api-contract.md`, `03-business-rules.md`, `04-implementation-status.md`, `02_FLOW_KHAM_BENH_VA_EMR.md`, `05_FLOW_VIEN_PHI_THANH_TOAN.md`, và `BACKEND_IMPLEMENTATION_WALKTHROUGH.md`.

## 🔌 BÁO CÁO TÍCH HỢP TOÀN DIỆN BACKEND VÀO GIAO DIỆN
👉 **[10-bao-cao-tich-hop-backend-frontend.md](./10-bao-cao-tich-hop-backend-frontend.md)**: Báo cáo kết quả gắn kết trực tiếp toàn bộ các API Backend (.NET 8) vào giao diện AdminUI và DoctorUI (Kê đơn, Tương tác thuốc, Ký số, RBAC Matrix, Audit Trail & Export CSV).

## 🚀 THAY THẾ DỮ LIỆU TĨNH BẰNG BACKEND CHO ADMIN UI
👉 **[11-bao-cao-trien-khai-admin-backend-replacement.md](./11-bao-cao-trien-khai-admin-backend-replacement.md)**: Báo cáo kết quả thay thế toàn bộ dữ liệu mock tại Dashboard, Examination Finance, Examination HR, Examination Reports và tính năng xuất CSV theo đúng checklist của tài liệu `ADMIN_BACKEND_REPLACEMENT_WALKTHROUGH.md`.

## 🛡️ PHÂN TÍCH FLOW HOẠT ĐỘNG SYSTEM DOMAIN & CLINICAL GOVERNANCE
👉 **[12-phan-tich-flow-hoat-dong-system-domain.md](./12-phan-tich-flow-hoat-dong-system-domain.md)**: Báo cáo phân tích chuyên sâu flow hoạt động của phân hệ Quản trị Hệ thống (`System Domain`), bao gồm IAM & Session, Granular RBAC, DataScope Engine, Dual Audit Trail, và Integration Gateways.
👉 **[07_FLOW_QUAN_TRI_HE_THONG_VA_GOVERNANCE.md](./bao-cao-technical-lead-his/tai-lieu-nghiep-vu-flows/07_FLOW_QUAN_TRI_HE_THONG_VA_GOVERNANCE.md)**: Tài liệu đặc tả chuẩn luồng hành vi nghiệp vụ y tế FLOW-07 (System & Clinical Governance Flow).
