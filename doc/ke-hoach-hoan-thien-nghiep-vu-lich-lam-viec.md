# Kế hoạch hoàn thiện nghiệp vụ lịch làm việc

## 1. Mục tiêu

Hoàn thiện flow vận hành:

```text
Lịch cố định
  → Sinh lịch ngày
  → Điều chỉnh lịch/nghỉ trong ngày
  → Chấm công
  → Điều chỉnh chấm công
  → Khóa kỳ chấm công
  → Tính lương
  → Duyệt, chốt và thanh toán
```

Mục tiêu chính là bảo đảm dữ liệu lịch, chấm công và lương không bị thay đổi ngầm sau khi đã xác nhận hoặc khóa kỳ.

## 2. Các vấn đề cần cải thiện

### 2.1. Domain

- Bổ sung các domain method cho `LichLamViec` thay vì cho phép thay đổi trực tiếp mọi thuộc tính:
  - Đổi ca.
  - Đổi phòng.
  - Ghi nhận nghỉ trong ngày.
  - Hủy lịch.
  - Khôi phục lịch về trạng thái làm việc.
- [x] Chặn cập nhật lịch khi đã có bản ghi chấm công.
- [x] Chặn cập nhật lịch khi ngày cũ hoặc ngày mới thuộc kỳ chấm công đã khóa.
  - Cần bổ sung tiếp cho thao tác xóa và kiểm tra kỳ lương đã chốt.
  - Kỳ lương đã chốt.
- [x] Bổ sung quy tắc chống trùng lịch cố định theo nhân viên, thứ, ca và khoảng hiệu lực.
- [x] Xác định rõ lịch ngày đã sinh từ lịch cố định là bản ghi độc lập để bảo toàn lịch sử.
- Bổ sung trạng thái hoặc metadata để phân biệt:
  - Lịch sinh từ lịch cố định.
  - Lịch tạo thủ công.
  - Lịch đã điều chỉnh.
  - Lịch bị hủy.
- Bảo đảm `ChamCong` chỉ được chuyển trạng thái qua các hành vi hợp lệ và không thể sửa sau khi kỳ bị khóa.

### 2.2. Lịch cố định và sinh lịch ngày

- [x] Tạo API bulk lịch cố định dạng transaction, thay cho việc UI gửi nhiều request bằng `Promise.all`.
- Bulk API phải trả kết quả chi tiết:
  - Số bản ghi tạo thành công.
  - Số bản ghi trùng.
  - Số nhân viên không thuộc khoa.
  - Số bản ghi bị bỏ qua.
- Khi cập nhật lịch cố định, phải xác định chính sách đối với lịch ngày đã sinh:
  - Không thay đổi lịch lịch sử; hoặc
  - Đồng bộ các ngày chưa chấm công.
- [x] Khi xóa lịch cố định, không xóa lịch ngày đã phát sinh; UI đã hiển thị rõ chính sách này.
- [x] Thêm chức năng preview sinh lịch trước khi ghi dữ liệu:
  - Tổng lịch dự kiến.
  - Lịch đã tồn tại.
  - Lịch xung đột.
  - Lịch có nhân viên không còn thuộc khoa.
  - Lịch nằm ngoài thời hạn hiệu lực.
- [x] Không cho sinh lịch nếu toàn bộ khoảng ngày không có lịch cố định còn hiệu lực.
- [x] Thao tác sinh lịch hiện chống chạy lặp và không tạo bản ghi trùng theo nhân viên, ca và ngày.

### 2.3. Nghỉ phép và nghỉ trong ngày

- [x] Khi duyệt đơn nghỉ phép:
  - Tìm các lịch ngày bị ảnh hưởng.
  - Chuyển lịch ngày theo chính sách nghỉ phép.
  - Tạo hoặc cập nhật chấm công thành `NGHI_PHEP` nếu chưa có check-in.
  - Ghi audit đầy đủ.
- [x] Khi hủy đơn nghỉ:
  - Chỉ khôi phục lịch nếu lịch chưa bị điều chỉnh độc lập.
  - Khôi phục chấm công về `CHUA_CHAM_CONG` nếu chưa phát sinh công.
  - Không ghi đè lịch đã có check-in/check-out.
- [x] Không cho duyệt đơn nghỉ trùng với đơn đã duyệt.
- Cảnh báo khi đơn nghỉ đè lên lịch đã có chấm công.
- Lưu người duyệt, thời điểm duyệt, lý do từ chối và lịch bị ảnh hưởng.

### 2.4. Chấm công và điều chỉnh công

- Check-in/check-out phải kiểm tra:
  - Lịch tồn tại và không ở trạng thái `NGHI`/`HUY`.
  - Nhân viên có đơn nghỉ đã duyệt hay không.
  - Kỳ chấm công đã khóa hay chưa.
  - Ca đã có bản ghi chấm công hay chưa.
- [x] Chặn điều chỉnh công sau khi kỳ chấm công bị khóa.
- Duyệt điều chỉnh công phải tính lại:
  - Giờ thực tế.
  - Đi muộn.
  - Về sớm.
  - Trạng thái chấm công.
- Audit phải lưu dữ liệu trước, dữ liệu sau, người yêu cầu, người duyệt và lý do.
- Bổ sung thao tác chốt vắng mặt có kiểm soát, tránh tự động đánh dấu nhầm ca chưa đến hạn.

### 2.5. Kỳ chấm công và kỳ lương

- [x] Không cho sửa lịch thuộc kỳ chấm công đã khóa.
  - Xóa lịch và kỳ lương đã chốt vẫn cần bổ sung.
- Không cho thay đổi dữ liệu đầu vào sau khi bảng lương đã sinh/chốt.
- [x] Khi tạo kỳ lương, chỉ cho chọn kỳ chấm công đã khóa.
- [x] Hiển thị rõ lý do không thể tính lương nếu kỳ chấm công chưa khóa.
- [x] Tự động đồng bộ và bắt buộc khoảng tính lương trùng kỳ chấm công.
- [x] Chặn tạo trùng kỳ lương theo tháng/năm.
- Lưu snapshot dữ liệu chấm công khi sinh bảng lương.
- Bổ sung audit cho:
  - Duyệt kỳ lương.
  - Chốt kỳ lương.
  - Ghi nhận thanh toán.
  - Điều chỉnh bảng lương.
- Thống nhất enum trạng thái kỳ lương thay cho chuỗi rời rạc.

## 3. Application và API cần bổ sung

### API đề xuất

```text
POST /api/LichLamViec/fixed/bulk
POST /api/LichLamViec/preview-generate
POST /api/LichLamViec/sync-leave/{leaveId}
GET  /api/LichLamViec/conflicts
GET  /api/ChamCong/report
GET  /api/ChamCong/summary-by-employee
GET  /api/ChamCong/summary-by-department
GET  /api/payroll/periods/{id}/export
GET  /api/payroll/periods/{id}/payslips/{employeeId}
```

### Yêu cầu application

- Mỗi command phải kiểm tra đầy đủ trạng thái khóa trước khi thay đổi dữ liệu.
- Các use case nhiều bước phải chạy trong một transaction.
- Chuẩn hóa lỗi nghiệp vụ thành response thống nhất cho UI.
- Không dùng silent fallback khi dữ liệu liên quan bị thiếu.
- Các truy vấn theo khoảng ngày phải dùng cùng timezone nghiệp vụ Việt Nam.
- Bổ sung phân quyền riêng cho:
  - Quản lý lịch.
  - Duyệt nghỉ phép.
  - Duyệt điều chỉnh công.
  - Khóa kỳ chấm công.
  - Duyệt/chốt/thanh toán lương.

## 4. AdminUI cần cải thiện

### Lịch tuần/tháng

- [x] Khi đổi tuần/tháng, tải đồng bộ:
  - Lịch ngày.
  - Chấm công.
  - KPI.
  - Đơn nghỉ.
  - Điều chỉnh công.
  - Kỳ chấm công.
- Hiển thị trạng thái bằng icon, màu, tooltip và label từ EnumCatalog.
- Khóa nút sửa/xóa/check-in/check-out khi backend xác định bản ghi không còn được phép thao tác.
- Hiển thị lý do bị khóa ngay trên UI.
- Có bộ lọc theo nhân viên, khoa, phòng khám, trạng thái và nguồn lịch.

### Lịch cố định

- [x] Thay nhiều request song song bằng một bulk API transaction.
- [x] Có bước preview và xác nhận trước khi sinh lịch.
- [x] Hiển thị kết quả tổng hợp tạo/bỏ qua/lỗi khi tạo hàng loạt.
- Cảnh báo rõ tác động khi sửa hoặc xóa lịch cố định.

### Chấm công

- Có filter theo trạng thái:
  - Chưa chấm công.
  - Thiếu check-out.
  - Đi muộn.
  - Về sớm.
  - Vắng mặt.
  - Nghỉ phép.
  - Chờ xác nhận.
- Hiển thị lịch sử điều chỉnh ngay trong chi tiết chấm công.
- Có dashboard theo ngày, tuần, tháng, nhân viên và khoa.
- Export báo cáo CSV/Excel và bản in có tiêu đề, khoảng thời gian, bộ lọc.

### Nghỉ phép

- Hiển thị các lịch ngày bị ảnh hưởng trước khi duyệt.
- Cảnh báo nếu đã có chấm công.
- Hiển thị người duyệt, thời điểm duyệt và lý do từ chối.
- Khi hủy đơn, hiển thị kết quả đồng bộ lịch/chấm công.

### Tính lương

- [x] Chọn kỳ chấm công từ danh sách kỳ đã khóa, không nhập mã thủ công.
- [x] Hiển thị tổng lương toàn kỳ.
- Hiển thị chi tiết phụ cấp, khấu trừ và thực lĩnh.
- [x] Có export bảng lương CSV và in bảng lương.
- [x] Đổi nhãn thao tác thành “Tạo kỳ tính lương” và “Tạo kỳ tính lương” trong modal để tránh hiểu nhầm là đã tính lương.
- [x] Tính lương theo ngày công thực tế với 26 ngày công chuẩn.
- [x] Khấu trừ ngày vắng và loại nghỉ không lương.
- [x] Tính tăng ca theo giờ vượt ca, hệ số 150%.
- [x] Khấu trừ đi muộn/về sớm theo số phút.
- [x] Tự động tính phụ cấp cố định và bảo hiểm người lao động.
- [x] Chỉ cho check-in/check-out trong kỳ chấm công đang mở.
- [x] Chặn check-in cho ngày tương lai hoặc trước giờ bắt đầu ca.
- [x] Điều chỉnh công quá khứ qua quy trình yêu cầu và duyệt riêng, không tạo check-in giả.
- Ẩn hoặc vô hiệu hóa hành động không phù hợp với trạng thái kỳ lương.

## 5. Thứ tự triển khai

### Giai đoạn 1 - Bảo vệ dữ liệu

1. Chặn sửa/xóa lịch sau chấm công hoặc khóa kỳ.
2. Chặn điều chỉnh công sau khóa kỳ.
3. Hoàn thiện audit lịch và chấm công.
4. Chuẩn hóa response lỗi nghiệp vụ.

### Giai đoạn 2 - Đồng bộ nghiệp vụ

1. Đồng bộ duyệt/hủy nghỉ phép với lịch ngày và chấm công.
2. Bổ sung transaction cho tạo/sinh lịch.
3. Bổ sung chống trùng lịch cố định.
4. Bổ sung preview sinh lịch.

### Giai đoạn 3 - Báo cáo và vận hành

1. Dashboard chấm công theo nhân viên/khoa/tháng.
2. Export báo cáo chấm công và bảng lương.
3. Phiếu lương cá nhân.
4. Hoàn thiện phân quyền theo nghiệp vụ.
5. Tối ưu tải dữ liệu và xử lý khoảng ngày lớn.

## 6. Tiêu chí hoàn thành

- Không thể sửa/xóa dữ liệu đã khóa hoặc đã được dùng để tính lương.
- Duyệt và hủy nghỉ phép không tạo dữ liệu lịch/chấm công sai lệch.
- Sinh lịch lặp lại không tạo bản ghi trùng.
- Bulk schedule không để lại dữ liệu tạo một phần khi transaction thất bại.
- Mọi thay đổi quan trọng đều có audit.
- UI phản ánh đúng trạng thái và lý do không thể thao tác.
- Báo cáo lịch, chấm công và lương dùng cùng khoảng ngày, timezone và bộ lọc.
- Có kiểm thử cho các case:
  - Trùng ca.
  - Ca qua ngày.
  - Nghỉ phép đã duyệt.
  - Hủy nghỉ phép.
  - Thiếu check-out.
  - Khóa kỳ.
  - Điều chỉnh công.
  - Sinh lương từ snapshot.

## 7. Kết luận

Flow hiện tại đã đủ nền tảng cho MVP nhưng cần hoàn thiện các điểm bảo vệ dữ liệu, đồng bộ trạng thái và transaction trước khi sử dụng ổn định trong vận hành phòng khám. Ưu tiên triển khai các giai đoạn theo thứ tự trên, bắt đầu từ việc khóa dữ liệu và đồng bộ nghỉ phép vì đây là các điểm có thể làm sai lịch công và bảng lương.
