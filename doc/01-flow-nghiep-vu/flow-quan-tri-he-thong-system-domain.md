# Flow Nghiệp Vụ Quản Trị Hệ Thống & Giám Sát Lâm Sàng (System & Clinical Governance Flow)

Tài liệu đặc tả chi tiết luồng nghiệp vụ hành vi System Domain (Mã flow: `FL-007`) đã được ban hành và lưu trữ tại thư mục quy chuẩn nghiệp vụ:

👉 **[Xem chi tiết FLOW-07: Quản trị Hệ thống, Phân quyền Dữ liệu và Giám sát Lâm sàng](../02-gap-analysis/bao-cao-technical-lead-his/tai-lieu-nghiep-vu-flows/07_FLOW_QUAN_TRI_HE_THONG_VA_GOVERNANCE.md)**

👉 **[Xem Báo cáo Phân tích Chuyên sâu Cấu trúc System Domain](../02-gap-analysis/12-phan-tich-flow-hoat-dong-system-domain.md)**

### Tóm Tắt 5 Trụ Cột Vận Hành Cốt Lõi:
1. **IAM & Session Lifecycle:** Xác thực đa tác nhân, cấp phát và thu hồi Token kép (`AccessToken` + `RefreshToken`).
2. **Granular RBAC & DataScope Engine:** Phân quyền tới từng hành động theo 4 cấp độ phạm vi dữ liệu (`ALL_FACILITIES`, `FACILITY_ONLY`, `BRANCH`, `DEPARTMENT_ONLY`).
3. **EMR Legal Audit Trail:** Nhật ký kiểm toán y khoa bất biến theo quy định tại Thông tư 46/2018/TT-BYT, hỗ trợ xuất báo cáo thanh tra CSV tối đa 10.000 dòng.
4. **Integration Gateways (LIS / PACS / BHYT):** Quản lý tập trung cổng giao tiếp mạng (HL7 MLLP 2575, DICOM AE Title 104, URL DICOM Viewer, Cổng giám định BHYT).
5. **EMR Lock & Validation:** Kiểm tra điều kiện hoàn tất hồ sơ y khoa và thực hiện ký số điện tử đóng hồ sơ chỉ đọc.
