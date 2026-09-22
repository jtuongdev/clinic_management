# Báo cáo cải tiến nghiệp vụ lịch làm việc

## 1. Phạm vi đã triển khai

Đã rà soát và cải tiến flow từ lịch cố định đến UI quản lý nhân viên theo tài liệu:

```text
Lịch cố định → Lịch ngày → Chấm công → Khóa kỳ → Tính lương
```

## 2. Hạng mục đã hoàn thành

### Domain/Application/API

- Bổ sung kiểm tra không cho cập nhật lịch ngày khi lịch đã có bản ghi chấm công.
- Bổ sung kiểm tra không cho cập nhật lịch ngày khi ngày cũ hoặc ngày mới thuộc kỳ chấm công đã khóa.
- Bổ sung kiểm tra ngày làm việc, trạng thái enum, ghi chú và dữ liệu đầu vào lịch ngày.
- Bổ sung chống trùng lịch cố định theo nhân viên, thứ, ca và khoảng hiệu lực.
- Giữ lịch ngày đã phát sinh độc lập với lịch cố định; xóa mẫu không xóa dữ liệu lịch sử.
- Giữ nguyên các kiểm tra check-in/check-out, đơn nghỉ đã duyệt và khóa kỳ chấm công hiện có.
- Khi duyệt đơn nghỉ, lịch ngày chưa chấm công được chuyển sang trạng thái nghỉ và bản ghi chấm công chưa phát sinh công được chuyển sang `NGHI_PHEP`.
- Khi hủy đơn nghỉ đã duyệt, hệ thống khôi phục lịch chưa có check-in/check-out và đưa bản ghi chấm công nghỉ phép chưa phát sinh công về trạng thái chưa chấm công.
- Cho phép hủy đơn nghỉ đã duyệt để hỗ trợ nghiệp vụ thu hồi nghỉ phép.
- Thêm endpoint bulk lịch cố định transaction với thống kê tạo, trùng, bỏ qua và nhân viên không thuộc khoa.
- Thêm endpoint preview sinh lịch ngày, trả về số lượng dự kiến, đã tồn tại, xung đột và nhân viên không thuộc khoa.
- Chặn sinh lịch khi toàn bộ khoảng ngày không có lịch cố định còn hiệu lực; preview hiển thị riêng số lịch nằm ngoài thời hạn.

### AdminUI

- Khi đổi tuần/tháng, UI tải đồng bộ:
  - Lịch ngày.
  - Chấm công.
  - KPI.
  - Đơn nghỉ.
  - Điều chỉnh chấm công.
  - Kỳ chấm công.
- Màn hình tính lương sử dụng danh sách kỳ chấm công đã khóa thay cho nhập mã thủ công.
- Hiển thị tổng thực lĩnh của toàn kỳ lương.
- Đã có xuất CSV và in bảng lương.
- Khi tạo kỳ tính lương, hệ thống chỉ nhận kỳ chấm công đã khóa, tự điền khoảng ngày tương ứng và hiển thị cảnh báo sẵn sàng.
- Backend chặn khoảng tính lương lệch kỳ chấm công và chặn tạo trùng tháng/năm.
- Công thức tính lương đã bổ sung: lương ngày theo 26 ngày chuẩn, trả theo ngày công, trừ nghỉ không lương, tăng ca hệ số 150%, trừ đi muộn/về sớm, phụ cấp cố định và bảo hiểm mặc định 10,5%.
- Check-in bị chặn nếu ngày làm việc chưa đến hoặc chưa tới giờ bắt đầu ca; check-in/check-out tiếp tục bị chặn khi kỳ chấm công đã khóa. Công quá khứ phải đi qua quy trình điều chỉnh và quản trị viên duyệt.
- Đã thay thuộc tính Drawer `width` đã deprecated bằng `size`.
- UI lịch cố định sử dụng bulk API thay cho nhiều request song song.
- UI sinh lịch ngày có bước xem trước và xác nhận.

## 3. Kiểm chứng

- `dotnet build ClinicManagement.slnx --no-restore`: thành công, 0 warning, 0 error.
- `npm run build` trong `ClinicManagement.AdminUI`: thành công.
- ESLint không có lỗi; còn một số cảnh báo hook cũ trong `ScheduleManagement.jsx`.

## 4. Các hạng mục chưa hoàn thành

Các mục sau vẫn cần triển khai để đạt đầy đủ nghiệp vụ vận hành:

- Đồng bộ nâng cao khi hủy đơn nghỉ phép theo nguồn thay đổi lịch độc lập.
- Đồng bộ nâng cao khi hủy đơn nghỉ phép theo nguồn thay đổi lịch độc lập.
- Chặn xóa lịch ngày thuộc kỳ đã khóa hoặc đã được dùng để tính lương.
- Kiểm tra kỳ lương đã chốt trước khi sửa lịch/chấm công.
- Báo cáo tổng hợp theo nhân viên/khoa/tháng và export Excel.
- Phiếu lương cá nhân.
- Phân quyền riêng theo từng nghiệp vụ.
- Bổ sung test tự động cho các case trùng ca, ca qua ngày, nghỉ phép, khóa kỳ và điều chỉnh công.

## 5. Lưu ý kỹ thuật

Chống trùng lịch cố định hiện đang được kiểm tra ở Application. Để chống race condition khi có nhiều request đồng thời, cần bổ sung chiến lược ràng buộc hoặc transaction ở database.

Việc khôi phục khi hủy đơn nghỉ hiện chỉ khôi phục lịch `NGHI` chưa có check-in/check-out. Khi bổ sung metadata nguồn thay đổi lịch, cần giới hạn chính xác chỉ các lịch bị thay đổi bởi chính đơn nghỉ đó.

Bulk lịch cố định đã chuyển sang endpoint transaction. Cần bổ sung thêm hiển thị chi tiết theo từng tổ hợp nhân viên/thứ/ca nếu nghiệp vụ yêu cầu.

## 6. Kết luận

Các cải tiến bảo vệ dữ liệu và đồng bộ màn hình chính đã hoàn thành. Flow hiện an toàn hơn khi điều chỉnh lịch sau chấm công hoặc trong kỳ đã khóa. Để hoàn tất nghiệp vụ production, cần ưu tiên tiếp theo là transaction bulk, preview sinh lịch và kiểm soát xóa/sửa theo kỳ lương.
