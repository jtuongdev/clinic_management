# Đặc tả UI/UX nghiệp vụ — Màn hình Quản lý Lịch Làm Việc

## 1. Mục tiêu tài liệu

Tài liệu này dùng làm **specification cho Frontend/UI/UX** của module **Lịch làm việc nhân viên** trong hệ thống HIS/Clinic Management.

Mục tiêu không chỉ là làm giao diện đẹp mà phải bảo đảm:

- UI phản ánh đúng nghiệp vụ quản lý lịch nhân viên.
- Phân biệt rõ **lịch cố định**, **lịch thực tế** và **chấm công**.
- Người dùng có thể nhìn nhanh tình trạng nhân sự theo tuần.
- Mỗi ô lịch phải thể hiện được **trạng thái nghiệp vụ**, không chỉ thời gian.
- Các thay đổi lịch phải có khả năng truy vết: lịch gốc → lịch thực tế → chấm công.
- Giảm thao tác khi lập lịch, điều chỉnh ca/phòng và kiểm tra thiếu chấm công.
- Thiết kế đủ rõ để Backend có thể cung cấp dữ liệu mà Frontend không phải tự suy diễn nghiệp vụ.

---

# 2. Mô hình nghiệp vụ cần UI phản ánh

Luồng nghiệp vụ đề xuất:

```text
LichLamViecCoDinh
        │
        │ Sinh lịch theo kỳ
        ▼
LichLamViec
        │
        ├── Làm việc
        ├── Nghỉ
        ├── Điều chỉnh ca
        ├── Điều chỉnh phòng
        └── Hủy lịch
                │
                ▼
             ChamCong
                │
                ├── Chưa check-in
                ├── Đã check-in
                ├── Đã check-out
                ├── Thiếu công
                └── Chờ xác nhận
```

## 2.1. Ý nghĩa của từng lớp

### Lịch cố định

Là quy tắc làm việc lặp lại của nhân viên.

Ví dụ:

```text
BS Nguyễn Văn A
Khoa: Tai Mũi Họng

Thứ 2: Ca sáng - P101
Thứ 3: Ca sáng - P101
Thứ 4: Ca sáng - P101
Thứ 5: Ca sáng - P101
Thứ 6: Ca sáng - P101
```

Lịch cố định mang tính **cấu hình / template**.

Không nên dùng lịch cố định để biểu diễn trực tiếp trạng thái chấm công.

### Lịch thực tế

Là lịch làm việc cụ thể của một nhân viên trong một ngày.

Ví dụ:

```text
09/09/2026
BS Nguyễn Văn A

Lịch cố định:
Ca sáng - P101

Lịch thực tế:
Nghỉ phép
```

Hoặc:

```text
10/09/2026

Lịch cố định:
Ca sáng - P101

Lịch thực tế:
Ca sáng - P102

Lý do:
Điều chỉnh phòng
```

### Chấm công

Là dữ liệu phát sinh khi nhân viên thực sự đi làm.

Ví dụ:

```text
Lịch:
06:00 - 14:00

Check-in:
05:56

Check-out:
13:38

Thực tế:
07h42
```

UI tuyệt đối không nên suy luận:

```text
Không có check-in = nghỉ
```

Vì:

```text
Không có check-in
```

có thể có nghĩa:

- Chưa đến giờ làm.
- Chưa check-in.
- Quên check-in.
- Thiết bị chấm công lỗi.
- Lịch đã hủy.
- Nhân viên nghỉ nhưng chưa cập nhật lịch.

---

# 3. Cấu trúc màn hình chính

## 3.1. Header

```text
LỊCH LÀM VIỆC
Quản lý lịch nhân viên · Khoa · Phòng · Chấm công

[Tuần này]  ‹  07 — 13/09/2026  ›
[Tuần] [Tháng] [+ Tạo lịch]
```

### Yêu cầu UX

Header phải trả lời ngay:

1. Đang xem module nào?
2. Đang xem khoảng thời gian nào?
3. Chế độ xem nào?
4. Có thao tác chính nào?

### Primary action

Nút:

```text
+ Tạo lịch
```

là primary action.

Các thao tác phụ:

```text
Xuất Excel
In lịch
Cài đặt
```

nên đặt trong menu phụ nếu có.

---

# 4. Bộ lọc nghiệp vụ

Đặt ngay dưới header hoặc trước vùng lịch.

```text
[Khoa: Tai Mũi Họng ▼]
[Phòng: Tất cả ▼]
[Nhân viên: Tất cả ▼]
[Ca: Tất cả ▼]
[Trạng thái: Tất cả ▼]

[🔍 Tìm nhân viên]
```

## 4.1. Filter Khoa

Dùng để giới hạn nhân viên thuộc khoa.

Ví dụ:

```text
Tất cả
Tai Mũi Họng
Nội tổng quát
Ngoại
Răng Hàm Mặt
```

## 4.2. Filter Phòng

Phòng phải phụ thuộc vào khoa nếu nghiệp vụ cho phép.

Ví dụ:

```text
Khoa: Tai Mũi Họng

Phòng:
Tất cả
P101
P102
P103
```

Không nên hiển thị toàn bộ phòng của hệ thống nếu người dùng đã chọn khoa.

## 4.3. Filter Ca

Ví dụ:

```text
Tất cả
Sáng
Chiều
Tối
Hành chính
```

## 4.4. Filter trạng thái

Nên dùng trạng thái nghiệp vụ:

```text
Tất cả
Đang làm việc
Chưa chấm công
Đã chấm công
Nghỉ phép
Nghỉ
Điều chỉnh
Thiếu công
Đã hủy
```

Không dùng quá nhiều trạng thái màu sắc nếu Backend không cung cấp trạng thái rõ ràng.

---

# 5. KPI tổng quan

KPI phải phục vụ việc ra quyết định nhanh.

```text
┌──────────────────────────────────────────────────────────────┐
│ NHÂN VIÊN    CA LÀM       ĐI LÀM       NGHỈ       THIẾU CC │
│    28          42            35          4           3       │
└──────────────────────────────────────────────────────────────┘
```

## 5.1. Định nghĩa KPI

### Nhân viên

Số nhân viên có lịch trong khoảng thời gian đang xem.

### Ca làm

Tổng số ca được lập.

### Đi làm

Số ca có trạng thái thực tế là đi làm / đã chấm công theo rule nghiệp vụ.

### Nghỉ

Số lịch được xác định là nghỉ.

### Thiếu chấm công

Số lịch đáng lẽ phải có dữ liệu chấm công nhưng chưa đủ.

## 5.2. Nguyên tắc

KPI phải lấy từ Backend.

Frontend không tự:

```javascript
employees.length
```

rồi coi đó là số nhân viên có lịch nếu API chưa định nghĩa như vậy.

---

# 6. Chuyển đổi Lịch thực tế / Lịch cố định

Hai tab:

```text
[Lịch thực tế] [Lịch cố định]
```

## 6.1. Lịch thực tế

Đây là view mặc định.

Dùng để:

- Theo dõi lịch hiện tại.
- Kiểm tra nhân viên đang làm.
- Kiểm tra nghỉ.
- Kiểm tra điều chỉnh.
- Theo dõi chấm công.

## 6.2. Lịch cố định

Dùng để:

- Xem mẫu lịch.
- Sửa lịch lặp.
- Thêm/xóa ngày làm cố định.
- Thay đổi ca mặc định.
- Thay đổi phòng mặc định.

Không nên trộn lịch cố định và lịch thực tế trong cùng một card.

---

# 7. Grid lịch tuần

Cấu trúc:

```text
                T2       T3       T4       T5       T6       T7       CN
             07/09    08/09    09/09    10/09    11/09    12/09    13/09

NHÂN VIÊN

BS Nguyễn
TMH
             [CA]     [CA]     [NGHỈ]   [CA]     [CA]

BS Trần
TMH
             [CA]     [CA]     [CA]     [NGHỈ]
```

## 7.1. Cột nhân viên

Không chỉ hiển thị:

```text
Nguyễn Văn A
Bác sĩ
```

Nên:

```text
┌────────────────────────┐
│ 👤 Nguyễn Văn A        │
│ Bác sĩ · TMH           │
│                        │
│ 5 ca / tuần            │
│ 38h kế hoạch           │
└────────────────────────┘
```

Thông tin ưu tiên:

1. Tên.
2. Chức danh.
3. Khoa/phòng ban.
4. Tổng ca.
5. Tổng giờ kế hoạch.

## 7.2. Sticky column

Cột nhân viên nên sticky khi scroll ngang.

Header ngày cũng nên sticky khi scroll dọc.

Điều này đặc biệt quan trọng khi có 50–200 nhân viên.

---

# 8. Card lịch — thành phần quan trọng nhất

Card lịch phải phản ánh **nghiệp vụ**, không phải chỉ là một block thời gian.

## 8.1. Cấu trúc card chuẩn

```text
┌─────────────────────────┐
│ ● ĐANG LÀM              │
│                         │
│ CA SÁNG                 │
│ 06:00 — 14:00           │
│                         │
│ 🏥 Phòng 101            │
│                         │
│ ✓ Check-in 05:56        │
│                         │
│ ─────────────────────── │
│ 7h 42m thực tế          │
└─────────────────────────┘
```

### Hierarchy

Thứ tự thông tin:

```text
1. Trạng thái
2. Loại ca
3. Thời gian
4. Phòng
5. Chấm công
6. Thời lượng thực tế
```

Không nên để:

```text
Phòng
```

ở vị trí nổi bật hơn trạng thái.

---

# 9. Trạng thái lịch

Nên thiết kế status system thống nhất.

## 9.1. Đang làm

```text
● ĐANG LÀM
```

Điều kiện hiển thị phải do Backend xác định hoặc frontend map từ trạng thái + thời gian hiện tại theo rule thống nhất.

Thông tin:

```text
CA SÁNG
06:00 — 14:00
P101

✓ Check-in 05:56
7h42m thực tế
```

## 9.2. Chưa chấm công

```text
○ CHƯA CHẤM CÔNG

CA SÁNG
06:00 — 14:00

🏥 P101

⚠ Chưa check-in
```

Đây là trạng thái cần attention.

Không được tự động chuyển thành:

```text
NGHỈ
```

## 9.3. Nghỉ phép

```text
— NGHỈ PHÉP

Ca sáng

Nghỉ phép năm
Đã duyệt
```

Có thể bổ sung:

```text
Người duyệt
Ngày duyệt
Lý do
```

trong detail drawer.

## 9.4. Điều chỉnh

```text
↻ ĐIỀU CHỈNH

Ca chiều
14:00 — 22:00

🏥 P102

Gốc:
Ca sáng · P101
```

Điều này giúp người dùng hiểu ngay:

> Đây không phải lịch ban đầu.

---

# 10. Status taxonomy đề xuất

Frontend nên chuẩn hóa thành các nhóm:

```text
SCHEDULE
├── SCHEDULED
├── ADJUSTED
├── CANCELLED

ATTENDANCE
├── NOT_CHECKED_IN
├── CHECKED_IN
├── CHECKED_OUT
├── INCOMPLETE

LEAVE
├── LEAVE_PENDING
├── LEAVE_APPROVED
├── LEAVE_REJECTED
```

Không nên dùng một field `TrangThai` duy nhất cho mọi nghiệp vụ nếu Backend có thể tách:

```text
TrangThaiLich
TrangThaiNghi
TrangThaiChamCong
```

Điều này giúp UI tránh logic kiểu:

```text
if (status === 5) ...
```

Nên dùng enum/constant có tên.

---

# 11. Màu sắc

Không dùng màu chỉ để trang trí.

Màu phải mang semantic meaning.

Đề xuất:

```text
Đang làm       → màu trạng thái tích cực
Đã chấm công   → màu tích cực
Chưa chấm công → màu cảnh báo
Thiếu công     → màu cảnh báo mạnh
Nghỉ phép      → màu trung tính
Điều chỉnh     → màu thông tin
Đã hủy         → màu lỗi / trung tính mạnh
```

## 11.1. Không phụ thuộc vào màu

Ví dụ không được chỉ:

```text
Card màu đỏ = nghỉ
```

Mà phải có:

```text
— NGHỈ PHÉP
```

Màu + icon + text phải cùng truyền tải trạng thái.

Điều này giúp:

- Accessibility.
- Màn hình độ sáng thấp.
- Người dùng khó phân biệt màu.
- In tài liệu.

---

# 12. Interaction của card

Card có 3 cấp tương tác.

## Cấp 1 — Hover

Hiển thị nhẹ:

```text
Xem chi tiết
Điều chỉnh
```

## Cấp 2 — Click

Mở Drawer bên phải:

```text
CHI TIẾT LỊCH

Nguyễn Văn A
09/09/2026

CA SÁNG
06:00 — 14:00
P101

Trạng thái:
Chưa chấm công
```

## Cấp 3 — Action

Trong drawer:

```text
[Điều chỉnh lịch]
[Đánh dấu nghỉ]
[Xem chấm công]
[Hủy lịch]
```

Các action nguy hiểm cần confirmation.

---

# 13. Drawer chi tiết lịch

Đề xuất:

```text
┌─────────────────────────────────┐
│ CHI TIẾT LỊCH                ×  │
├─────────────────────────────────┤
│ Nguyễn Văn A                    │
│ Bác sĩ · Tai Mũi Họng           │
│                                 │
│ 09/09/2026                      │
│                                 │
│ Lịch gốc                        │
│ Ca sáng · 06:00–14:00 · P101    │
│                                 │
│ Lịch thực tế                    │
│ Nghỉ phép năm                   │
│ Đã duyệt                        │
│                                 │
│ CHẤM CÔNG                       │
│ Check-in: —                     │
│ Check-out: —                    │
│ Thực tế: —                      │
│                                 │
│ LỊCH SỬ                         │
│ 08:32  Điều chỉnh bởi Admin     │
│ 09:10  Nghỉ phép được duyệt     │
│                                 │
│ [Đóng] [Điều chỉnh lịch]        │
└─────────────────────────────────┘
```

---

# 14. Lịch cố định — UI riêng

Không dùng grid thực tế với status chấm công.

```text
LỊCH CỐ ĐỊNH

Nguyễn Văn A
Bác sĩ · TMH

T2    Ca sáng    P101
T3    Ca sáng    P101
T4    Ca sáng    P101
T5    Ca sáng    P101
T6    Ca sáng    P101

[ Sửa lịch cố định ]
```

## 14.1. Tạo lịch cố định

Form:

```text
Nhân viên *
Khoa *
Phòng
Ngày áp dụng *
Ngày kết thúc
────────────────
Thứ trong tuần
☑ T2
☑ T3
☑ T4
☑ T5
☑ T6

Ca *
Phòng *
────────────────
[Hủy] [Lưu]
```

Validation:

- Không cho trùng lịch.
- Không cho ca có thời gian không hợp lệ.
- Không cho phòng không thuộc phạm vi sử dụng.
- Không cho ngày kết thúc trước ngày bắt đầu.

---

# 15. Tạo lịch thực tế

Có thể hỗ trợ hai cách.

## Cách 1 — Tạo đơn

```text
Nhân viên
Ngày
Ca
Phòng
Trạng thái
Ghi chú
```

## Cách 2 — Tạo hàng loạt

Ví dụ:

```text
Nhân viên:
☑ BS Nguyễn
☑ BS Trần
☑ BS Lê

Khoảng ngày:
07/09 → 13/09

Ca:
Ca sáng

Phòng:
P101
```

Action:

```text
[Kiểm tra xung đột]
[Tạo lịch]
```

---

# 16. Kiểm tra xung đột lịch

Đây là nghiệp vụ rất quan trọng.

Khi tạo/điều chỉnh lịch phải kiểm tra:

```text
Một nhân viên
+
Một khoảng thời gian
+
Hai lịch trùng nhau
```

Ví dụ:

```text
⚠ XUNG ĐỘT LỊCH

Nguyễn Văn A đã có:

10/09
06:00 — 14:00
P101

Bạn đang tạo:

10/09
08:00 — 16:00
P102
```

Không nên chỉ báo:

```text
Có lỗi
```

Mà phải cho người dùng biết **xung đột với lịch nào**.

---

# 17. Điều chỉnh lịch

Điều chỉnh phải giữ được lịch gốc.

Ví dụ:

```text
Lịch gốc
Ca sáng · P101

        ↓

Điều chỉnh

Ca chiều · P102
```

Database/API nên giữ thông tin:

```text
LichGocId
LoaiDieuChinh
LyDoDieuChinh
NguoiDieuChinh
ThoiGianDieuChinh
```

UI:

```text
↻ ĐIỀU CHỈNH

Ca chiều
14:00 — 22:00
P102

Gốc:
Ca sáng · P101

Lý do:
Thiếu nhân sự ca chiều
```

---

# 18. Chấm công

Card lịch chỉ nên hiển thị summary.

Chi tiết đưa vào drawer.

## Summary

```text
✓ Check-in 05:56
✓ Check-out 13:38
7h42m thực tế
```

## Detail

```text
CHẤM CÔNG

Ca kế hoạch:
06:00 — 14:00

Check-in:
05:56

Check-out:
13:38

Tổng:
07h42

Đi trễ:
Không

Về sớm:
22 phút

Trạng thái:
Thiếu giờ
```

Rule tính toán nên do Backend xác định.

Frontend chỉ hiển thị kết quả.

---

# 19. Empty state

Không để màn hình trắng.

Ví dụ:

```text
Không có lịch làm việc

Không tìm thấy lịch phù hợp với bộ lọc hiện tại.

[ Xóa bộ lọc ]
```

Nếu chưa có lịch:

```text
Tuần này chưa có lịch

Bạn có thể tạo lịch mới hoặc sinh lịch từ lịch cố định.

[+ Tạo lịch]
[Sinh từ lịch cố định]
```

---

# 20. Loading state

Không nên toàn màn hình trắng.

Dùng skeleton:

```text
Nhân viên        T2       T3       T4       T5

████████         ████     ████     ████     ████
████████         ████     ████     ████     ████
```

Đặc biệt khi dữ liệu lớn.

---

# 21. Error state

Ví dụ:

```text
Không thể tải lịch làm việc

Dữ liệu lịch chưa được tải thành công.

[Thử lại]
```

Nếu lỗi do Backend:

```text
Không thể lưu lịch

Lịch chưa được cập nhật.

[Thử lại] [Đóng]
```

Không hiển thị stack trace cho người dùng.

---

# 22. Responsive

Desktop là layout chính vì đây là hệ thống quản trị.

## Desktop

```text
Sidebar
+
Main
+
Weekly Grid
```

## Tablet

Giữ grid nhưng giảm thông tin card.

## Mobile

Không cố nhét 7 ngày vào màn hình.

Chuyển thành:

```text
07/09 — Thứ 2

Nguyễn Văn A
[CA SÁNG]
06:00–14:00
P101
```

Có thể swipe giữa các ngày.

---

# 23. Accessibility

Phải có:

- Contrast đủ cao.
- Focus state.
- Keyboard navigation.
- Không phụ thuộc hoàn toàn vào màu.
- Icon có tooltip/aria-label.
- Button có trạng thái disabled rõ ràng.
- Text trạng thái luôn xuất hiện.

Ví dụ:

```text
✓ ĐÃ CHẤM CÔNG
```

tốt hơn:

```text
🟢
```

---

# 24. Quy tắc UI không được vi phạm

## Không được

```text
Card = Ca + thời gian
```

## Phải

```text
Card = Trạng thái
     + Ca
     + Thời gian
     + Phòng
     + Chấm công
     + Dấu hiệu điều chỉnh
```

---

## Không được

Frontend tự quyết định nghiệp vụ:

```javascript
if (!checkIn) {
    status = "NGHI";
}
```

## Phải

```javascript
status = schedule.status;
attendanceStatus = attendance.status;
```

Frontend chỉ map dữ liệu thành UI.

---

## Không được

Dùng:

```javascript
status === 1
status === 2
status === 3
```

## Nên

```javascript
ScheduleStatus.WORKING
ScheduleStatus.LEAVE
ScheduleStatus.ADJUSTED
```

---

# 25. API contract đề xuất

Backend nên trả dữ liệu đủ cho UI.

Ví dụ:

```json
{
  "employee": {
    "id": 101,
    "name": "Nguyễn Văn A",
    "title": "Bác sĩ",
    "department": "Tai Mũi Họng"
  },
  "date": "2026-09-09",
  "schedule": {
    "id": 10001,
    "status": "WORKING",
    "shift": {
      "id": 1,
      "name": "Ca sáng",
      "start": "06:00",
      "end": "14:00"
    },
    "room": {
      "id": 101,
      "name": "P101"
    },
    "isAdjusted": false,
    "originalScheduleId": null
  },
  "attendance": {
    "status": "CHECKED_IN",
    "checkIn": "05:56",
    "checkOut": null,
    "actualMinutes": 462
  }
}
```

Điểm quan trọng:

```text
schedule.status
```

và:

```text
attendance.status
```

không nên gộp thành một field nếu hai khái niệm có thể độc lập.

---

# 26. Frontend data model

Đề xuất TypeScript:

```ts
interface Employee {
  id: number;
  name: string;
  title: string;
  departmentName: string;
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

interface Room {
  id: number;
  name: string;
}

interface Schedule {
  id: number;
  date: string;
  status: ScheduleStatus;
  shift: Shift | null;
  room: Room | null;

  isAdjusted: boolean;
  originalScheduleId: number | null;
  adjustmentReason?: string | null;
}

interface Attendance {
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  actualMinutes: number | null;
}

interface EmployeeScheduleDay {
  employee: Employee;
  schedule: Schedule | null;
  attendance: Attendance | null;
}
```

---

# 27. Component architecture

Đề xuất:

```text
SchedulePage
│
├── ScheduleHeader
│
├── ScheduleSummary
│
├── ScheduleFilters
│
├── ScheduleViewTabs
│
└── ScheduleCalendar
    │
    ├── CalendarHeader
    │
    ├── EmployeeColumn
    │
    └── EmployeeScheduleRow
        │
        └── ScheduleCard
            ├── ScheduleStatus
            ├── ShiftInfo
            ├── RoomInfo
            ├── AttendanceSummary
            └── AdjustmentBadge
```

Drawer:

```text
ScheduleDetailDrawer
├── EmployeeSummary
├── ScheduleInfo
├── AttendanceInfo
├── AdjustmentInfo
├── ScheduleHistory
└── ScheduleActions
```

Modal:

```text
CreateScheduleModal
EditScheduleModal
AdjustScheduleModal
LeaveScheduleModal
ConflictModal
```

---

# 28. UX flow quan trọng

## Flow 1 — Xem lịch

```text
Mở màn hình
    ↓
Tuần hiện tại
    ↓
Backend trả lịch
    ↓
Hiển thị KPI
    ↓
Hiển thị Grid
```

## Flow 2 — Tạo lịch

```text
+ Tạo lịch
    ↓
Chọn nhân viên
    ↓
Chọn ngày
    ↓
Chọn ca
    ↓
Chọn phòng
    ↓
Kiểm tra xung đột
    ↓
Xác nhận
    ↓
Backend lưu
    ↓
Refresh dữ liệu
```

## Flow 3 — Điều chỉnh

```text
Click card
    ↓
Drawer
    ↓
Điều chỉnh lịch
    ↓
Hiển thị lịch gốc
    ↓
Chọn ca/phòng mới
    ↓
Nhập lý do
    ↓
Kiểm tra xung đột
    ↓
Lưu
```

## Flow 4 — Kiểm tra thiếu công

```text
Filter:
Trạng thái = Thiếu chấm công
    ↓
Grid chỉ hiển thị trường hợp cần xử lý
    ↓
Click card
    ↓
Xem detail
    ↓
Xác nhận / điều chỉnh / bổ sung công
```

---

# 29. Những gì nên ưu tiên trong UI

Theo mức độ nghiệp vụ:

### P0 — Bắt buộc

- Lịch thực tế.
- Tuần/tháng.
- Filter khoa/phòng/nhân viên/ca.
- Status lịch.
- Ca + thời gian.
- Phòng.
- Chấm công summary.
- Điều chỉnh.
- Drawer detail.
- Tạo lịch.
- Kiểm tra xung đột.

### P1 — Nên có

- Lịch cố định.
- Tạo hàng loạt.
- Sinh lịch từ lịch cố định.
- Lịch sử thay đổi.
- Filter thiếu công.
- Xuất Excel.
- Sticky employee column.
- Skeleton/loading.

### P2 — Có thể mở rộng

- Drag & drop lịch.
- Auto scheduling.
- Cảnh báo thiếu nhân sự.
- Thống kê giờ làm.
- Phân tích overtime.
- Gợi ý điều phối nhân sự.

---

# 30. Nguyên tắc quan trọng nhất

Màn hình này **không phải Calendar UI đơn thuần**.

Nó là:

```text
WORKFORCE SCHEDULING
        +
ATTENDANCE MONITORING
        +
SCHEDULE ADJUSTMENT
```

Do đó UI phải giúp người dùng trả lời được 6 câu hỏi:

```text
1. Ai đang có lịch?

2. Người đó làm ca nào?

3. Làm ở phòng nào?

4. Lịch này có bị điều chỉnh không?

5. Người đó đã chấm công chưa?

6. Có vấn đề gì cần xử lý không?
```

Nếu một card không trả lời được các câu hỏi trên khi cần thiết, card đó đang thiếu thông tin nghiệp vụ.

---

# 31. Thiết kế cuối cùng đề xuất

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ LỊCH LÀM VIỆC                                                            │
│ Quản lý lịch nhân viên · Khoa · Phòng · Chấm công                        │
│                                                                          │
│ [Tuần này]  ‹  07 — 13/09/2026  ›      [Tuần] [Tháng] [+ Tạo lịch]     │
├──────────────────────────────────────────────────────────────────────────┤
│ [Khoa ▼] [Phòng ▼] [Nhân viên ▼] [Ca ▼] [Trạng thái ▼] [🔍 Tìm kiếm]    │
├──────────────────────────────────────────────────────────────────────────┤
│ NHÂN VIÊN      CA LÀM       ĐI LÀM       NGHỈ       THIẾU CC             │
│    28            42           35          4           3                  │
├──────────────────────────────────────────────────────────────────────────┤
│ [Lịch thực tế]       [Lịch cố định]                                     │
├──────────────────────────────────────────────────────────────────────────┤
│             T2        T3        T4        T5        T6        T7       CN │
│             07/09     08/09     09/09     10/09     11/09     12/09    13/09
│                                                                          │
│ Nguyễn A    ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐             │
│ Bác sĩ TMH  │● ĐL │   │● ĐL │   │— NP │   │↻ ĐC │   │○ CC │             │
│ 5 ca/tuần   │06-14│   │06-14│   │     │   │14-22│   │06-14│             │
│             │P101 │   │P101 │   │Duyệt│   │P102 │   │P101 │             │
│             │✓5:56│   │✓5:58│   │     │   │Gốc: │   │⚠Chưa│             │
│             └─────┘   └─────┘   └─────┘   │06-14│   │CC   │             │
│                                           └─────┘   └─────┘             │
│                                                                          │
│ Trần B      ┌─────┐   ┌─────┐   ┌─────┐                                │
│ Bác sĩ TMH  │CHIỀU│   │CHIỀU│   │CHIỀU│                                │
│             │14-22│   │14-22│   │14-22│                                │
│             │P201 │   │P201 │   │P201 │                                │
│             └─────┘   └─────┘   └─────┘                                │
└──────────────────────────────────────────────────────────────────────────┘
```

## Kết luận

Thiết kế nên đi theo nguyên tắc:

```text
Lịch cố định
     ↓
Lịch thực tế
     ↓
Điều chỉnh
     ↓
Chấm công
     ↓
Trạng thái cần xử lý
```

**Frontend không tự tạo ra nghiệp vụ.** Backend phải trả về dữ liệu và trạng thái đủ rõ; Frontend chịu trách nhiệm trình bày, tương tác, validation cơ bản và điều hướng người dùng.

Đây là hướng phù hợp hơn nhiều so với việc chỉ xây một calendar có các ô:

```text
Ca sáng
06:00–14:00
P101
```

vì trong HIS, giá trị của màn hình nằm ở việc người dùng **nhìn thấy tình trạng vận hành và vấn đề cần xử lý**, chứ không chỉ nhìn thấy lịch.
