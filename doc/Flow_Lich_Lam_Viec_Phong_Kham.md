# Flow nghiệp vụ Lịch Làm Việc phòng khám

## 1. Mục tiêu

Hệ thống sử dụng `LichLamViecCoDinh` làm **lịch mẫu/mặc định dài hạn** của nhân viên.

`LichLamViec` là **lịch thực tế theo từng ngày**, dùng để phản ánh lịch thực tế và xử lý các ngoại lệ như:

- Nghỉ
- Đổi ca
- Đổi phòng

**Nguyên tắc quan trọng:** Thay đổi xảy ra trong một ngày cụ thể **không được làm thay đổi `LichLamViecCoDinh`**.

---

## 2. Flow tổng quát

```text
                 LichLamViecCoDinh
                 (Lịch mẫu dài hạn)
                          │
                          │ áp dụng
                          ▼
                   LichLamViec
                 (Lịch thực tế)
                          │
             ┌────────────┴────────────┐
             │                         │
       Không có ngoại lệ          Có ngoại lệ
             │                         │
             ▼                         ▼
      Theo lịch cố định          Điều chỉnh LLV
                                       │
                         ┌─────────────┼─────────────┐
                         │             │             │
                         ▼             ▼             ▼
                       Nghỉ          Đổi ca       Đổi phòng
                         │             │             │
                         └─────────────┴─────────────┘
                                       │
                                       ▼
                              Lịch thực tế cuối cùng
```

---

## 3. Vai trò của `LichLamViecCoDinh`

`LichLamViecCoDinh` mô tả lịch làm việc **thông thường và dài hạn** của nhân viên.

Ví dụ:

```text
BS Nguyễn Văn A
Khoa Tai Mũi Họng

Thứ 2 → Ca sáng → Phòng 101
Thứ 3 → Ca sáng → Phòng 101
Thứ 4 → Ca sáng → Phòng 101
Thứ 5 → Ca sáng → Phòng 101
Thứ 6 → Ca sáng → Phòng 101
```

Đây là lịch gốc.

Không sửa lịch gốc chỉ vì nhân viên nghỉ hoặc đổi ca trong một ngày cụ thể.

---

## 4. Vai trò của `LichLamViec`

`LichLamViec` đại diện cho **lịch thực tế của một ngày cụ thể**.

Nó được xác định dựa trên `LichLamViecCoDinh`.

Ví dụ:

```text
LichLamViecCoDinh:

Thứ 3 → Ca sáng → Phòng 101
```

Khi đến ngày thứ 3:

```text
LichLamViec:

Ngày 08/09
BS Nguyễn Văn A
Ca sáng
Phòng 101
```

Nếu không có thay đổi thì giữ theo lịch cố định.

---

## 5. Trường hợp không có thay đổi

```text
LichLamViecCoDinh
        │
        ▼
Thứ 3 → Ca sáng → P101
        │
        ▼
LichLamViec
        │
        ▼
Thứ 3 → Ca sáng → P101
```

Không cần thay đổi gì ở `LichLamViecCoDinh`.

---

## 6. Trường hợp nhân viên nghỉ một ngày

Ví dụ lịch cố định:

```text
BS A
T2 → Ca sáng
T3 → Ca sáng
T4 → Ca sáng
T5 → Ca sáng
T6 → Ca sáng
```

BS A xin nghỉ thứ 3.

Xử lý:

```text
LichLamViecCoDinh
T3 → Ca sáng
        │
        ▼
LichLamViec
T3 → Nghỉ
```

**Không sửa `LichLamViecCoDinh`.**

Lý do:

- Lịch cố định vẫn là lịch bình thường của BS A.
- Việc nghỉ chỉ xảy ra trong ngày cụ thể.
- Ngày khác vẫn áp dụng lịch cố định bình thường.

---

## 7. Trường hợp đổi ca

Lịch cố định:

```text
T3 → Ca sáng
```

Nhưng ngày cụ thể nhân viên đổi sang ca chiều:

```text
LichLamViecCoDinh
T3 → Ca sáng
        │
        ▼
LichLamViec
T3 → Ca chiều
```

**Không sửa `LichLamViecCoDinh`.**

---

## 8. Trường hợp đổi phòng

Lịch cố định:

```text
T3 → Ca sáng → P101
```

Nhưng ngày cụ thể đổi sang P102:

```text
LichLamViecCoDinh
T3 → Ca sáng → P101
        │
        ▼
LichLamViec
T3 → Ca sáng → P102
```

**Không sửa `LichLamViecCoDinh`.**

---

## 9. Khi nào được sửa `LichLamViecCoDinh`?

Chỉ sửa khi lịch thay đổi **mang tính dài hạn/thường xuyên**.

Ví dụ lịch cũ:

```text
T2 → Ca sáng → P101
T3 → Ca sáng → P101
T4 → Ca sáng → P101
T5 → Ca sáng → P101
T6 → Ca sáng → P101
```

Từ tháng sau BS A chuyển sang:

```text
T2 → Ca sáng → P101
T3 → Ca chiều → P102
T4 → Ca chiều → P102
T5 → Ca sáng → P101
T6 → Ca sáng → P101
```

Đây là thay đổi lịch cố định.

Khi đó mới cập nhật:

```text
LichLamViecCoDinh
```

---

## 10. Quy tắc nghiệp vụ

### Quy tắc 1

`LichLamViecCoDinh` = **lịch mẫu dài hạn**

> Nhân viên bình thường sẽ làm như thế nào?

### Quy tắc 2

`LichLamViec` = **lịch thực tế theo ngày**

> Ngày cụ thể này nhân viên thực tế sẽ làm như thế nào?

### Quy tắc 3

Ngoại lệ một ngày:

```text
Nghỉ
Đổi ca
Đổi phòng
```

→ Chỉ xử lý trên `LichLamViec`.

### Quy tắc 4

Thay đổi lịch lâu dài:

```text
Thay đổi ngày làm
Thay đổi ca thường xuyên
Thay đổi phòng thường xuyên
```

→ Cập nhật `LichLamViecCoDinh`.

---

## 11. Flow cuối cùng

```text
                    NHÂN VIÊN
                        │
                        ▼
              LichLamViecCoDinh
                 (Lịch dài hạn)
                        │
                        │ áp dụng theo ngày
                        ▼
                 LichLamViec
                 (Lịch thực tế)
                        │
              ┌─────────┴─────────┐
              │                   │
        Không thay đổi          Có thay đổi
              │                   │
              ▼                   ▼
        Theo LLVCD          Điều chỉnh LLV
                                  │
                     ┌────────────┼────────────┐
                     ▼            ▼            ▼
                   Nghỉ         Đổi ca      Đổi phòng
                     │            │            │
                     └────────────┴────────────┘
                                  │
                                  ▼
                         Lịch thực tế cuối cùng
```

---

## 12. Tóm tắt

```text
LichLamViecCoDinh
    ↓
Nguồn lịch mặc định
    ↓
LichLamViec
    ↓
Lịch thực tế từng ngày
    ↓
Nếu có ngoại lệ → sửa LichLamViec
```

**Không sửa `LichLamViecCoDinh` cho các ngoại lệ chỉ xảy ra trong một ngày.**

**Chỉ sửa `LichLamViecCoDinh` khi muốn thay đổi lịch làm việc mặc định trong thời gian dài.**

## 13. Phạm vi hiện tại

Hệ thống hiện tại:

- Không sử dụng `LichTruc`.
- Không sử dụng `PhanCong`.
- `LichLamViecCoDinh` là lịch mẫu dài hạn.
- `LichLamViec` là lịch thực tế và xử lý ngoại lệ.
